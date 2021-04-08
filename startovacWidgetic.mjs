/**
* @private
* @module StartovacWidgeticPrivate
* @classdesc Privátní část vlastního widgetu pro Startovač… s nastavením, to je důležité.
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/startovac-widgetic
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q1 2020
* @version 0.5
* @readonly
*/
const StartovacWidgeticPrivate = class
{

	static TYPE_STRING = 'String';
	static TYPE_OBJECT = 'Object';
	static BR_NODE_NAME = 'BR';
	static SPAN_NODE_NAME = 'SPAN';
	static LINK_NODE_NAME = 'LINK';
	static HTML_ANCHOR_ELEMENT = 'A';
	static IMAGE_NODE_NAME = 'IMG';
	static PICTURE_NODE_NAME = 'PICTURE';
	static FIGURE_NODE_NAME = 'FIGURE';

	/**
	 * @public
	 * @type {Object}
	 * @description default settings… can be overwritten
	 */
	settings = {
		projectURL: 'https://www.startovac.cz/patron/vedator/', // váš projekt na Startovači
		rootElementId: 'startovac-canvas',
		isPatron: null,
		structure: [
			'picture',
			'br',
			'title',
			'description',
			// 'perks', // @feature request
			'meter',
			'percentText',
			'countdownText',
			'supportLink',
			'moneyCollected',
			'nSupporters',
		],
		CSSStyleSheets: [
			{ href: '/startovac-widgetic.css', integrity: 'sha256-7FQgVDQuvMdPJ4B8WGrq7/z9jjMxdA+x3D22JBnuOjk=' }
		],
		resultSnippetElements: {
			title: 'STRONG',
			description: 'P',
			picture: 'PICTURE',
			meter: 'METER',
			percentText: 'P',
			nSupporters: 'P',
			moneyCollected: 'P',
		},
		resultSnippetBehaviour: {
			titleIsLink: true,
			useOnlyPatronDefaultDescription: false,
			allowLineBreak: true,
			supportInNewTab: true,
			titleInNewTab: true,
			nSupportersInNewTab: true,
			meter: {
				low: '20%',
				high: '50%',
				optimum: '100%',
			},
			nSupportersUrlSuffix: 'starteri',
		},
		texts: {
			pictureAlt: null,
			percentDone: ' splněno',
			patronDefaultDescription: 'U Patrona podporujete autora a projekt pravidelně. Pročtěte si popis projektu, ať se správně rozhodnete.',
			support: 'Přispět',
			pledged: ' vybráno',
			nSupporters: 'Již přispělo ',
			backersPlural: ' Startérů',
			//patronsPlural: ' patronů', // @todo
		},
		clientCacheFor: 15 * 60, // in seconds
		modulesImportPath: 'https://iiic.dev/js/modules',
		autoRun: true,
	};

	/**
	 * @public
	 * @type {HTMLElement}
	 */
	rootElement = HTMLElement;

	/**
	 * @public
	 * @type {URL}
	 */


	/**
	* @public
	* @type {Object}
	*/
	startovacData = Object;

	async initImportWithIntegrity ( /** @type {Object} */ settings = null )
	{

		console.groupCollapsed( '%c StartovacWidgeticPrivate %c initImportWithIntegrity %c(' + ( settings === null ? 'without settings' : 'with settings' ) + ')',
			StartovacWidgetic.CONSOLE.CLASS_NAME,
			StartovacWidgetic.CONSOLE.METHOD_NAME,
			StartovacWidgetic.CONSOLE.INTEREST_PARAMETER
		);
		console.debug( { arguments } );
		console.groupEnd();

		return new Promise( ( /** @type { Function } */ resolve ) =>
		{
			const ip = settings && settings.modulesImportPath ? settings.modulesImportPath : this.settings.modulesImportPath;
			import( ip + '/importWithIntegrity.mjs' ).then( ( /** @type {Module} */ module ) =>
			{
				/** @type {Function} */
				this.importWithIntegrity = module.importWithIntegrity;
				resolve( true );
			} ).catch( () =>
			{
				const SKIP_SECURITY_URL = '#skip-security-test-only'
				if ( window.location.hash === SKIP_SECURITY_URL ) {
					console.warn( '%c StartovacWidgeticPrivate %c initImportWithIntegrity %c without security!',
						StartovacWidgetic.CONSOLE.CLASS_NAME,
						StartovacWidgetic.CONSOLE.METHOD_NAME,
						StartovacWidgetic.CONSOLE.WARNING
					);
					this.importWithIntegrity = (/** @type {String} */ path ) =>
					{
						return new Promise( ( /** @type {Function} */ resolve ) =>
						{
							import( path ).then( ( /** @type {Module} */ module ) =>
							{
								resolve( module );
							} );
						} );
					};
					resolve( true );
				} else {
					throw 'Security Error : Import with integrity module is missing! You can try to skip this error by adding ' + SKIP_SECURITY_URL + ' hash into website URL';
				}
			} );
		} );
	}

	recountMeterSettingsBy ( /** @type {HTMLMeterElement} */ meter )
	{
		const calcProportion = ( /** @type {Number} */ val ) =>
		{
			const PERCENTAGE_BASE = 100;
			let proportion = ( meter.max / PERCENTAGE_BASE ) * val;
			if ( proportion > meter.max ) {
				proportion = meter.max;
			} else if ( proportion < meter.min ) {
				proportion = meter.min;
			}
			return proportion;
		}
		const calcPercentage = ( /** @type {Number | String} */ val, /** @type {String | null} */ name = null ) =>
		{
			const PERCENT_CHAR = '%';
			if ( val ) {
				if ( val.constructor.name === StartovacWidgeticPrivate.TYPE_STRING ) {
					const d = new RegExp( '\\d+' );
					val = val.trim();
					if ( val.substr( val.length - 1 ) === PERCENT_CHAR ) {
						const num = val.match( d )[ 0 ];
						if ( num ) {
							val = calcProportion( Number( num ) );
						}
					}
					val = Number( val );
				}
			}
			if ( name ) {
				this.settings.resultSnippetBehaviour.meter[ name ] = val;
			}
			return val;
		}
		const low = calcPercentage( this.settings.resultSnippetBehaviour.meter.low, 'low' );
		const high = calcPercentage( this.settings.resultSnippetBehaviour.meter.high, 'high' );
		calcPercentage( this.settings.resultSnippetBehaviour.meter.optimum, 'optimum' );
		if ( high < low ) {
			this.settings.resultSnippetBehaviour.meter.high = low;
		}
	}

	elCreator = {
		picture: () =>
		{
			const NAME = 'picture';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements[ NAME ];
				if ( tag ) {

					/** @type {HTMLImageElement} */
					let img = ( document.createElement( StartovacWidgeticPrivate.IMAGE_NODE_NAME ) );

					img.src = this.startovacData.photo.small_image;
					img.alt = this.settings.texts.pictureAlt ? this.settings.texts.pictureAlt : this.startovacData.name;

					if ( tag === StartovacWidgeticPrivate.PICTURE_NODE_NAME ) {

						/** @type {HTMLPictureElement} */
						const picture = ( document.createElement( StartovacWidgeticPrivate.PICTURE_NODE_NAME ) );

						picture.appendChild( img );
						//@ts-ignore
						img = picture;
					} else if ( tag === StartovacWidgeticPrivate.FIGURE_NODE_NAME ) {
						// @todo
					}

					this.rootElement.appendChild( img );
				}
				resolve( true );
			} );
		},
		br: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				if ( this.settings.resultSnippetBehaviour.allowLineBreak ) {
					this.rootElement.appendChild( document.createElement( StartovacWidgeticPrivate.BR_NODE_NAME ) );
				}
				resolve( true );
			} );
		},
		title: () =>
		{
			const NAME = 'title';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements[ NAME ];
				if ( tag ) {
					let title = document.createElement( tag );
					title.appendChild( document.createTextNode( this.startovacData.name ) );
					if ( this.settings.resultSnippetBehaviour.titleIsLink ) {

						/** @type {HTMLAnchorElement} */
						const anchor = ( document.createElement( StartovacWidgeticPrivate.HTML_ANCHOR_ELEMENT ) );

						anchor.href = this.startovacData.urls.startovac_project_url;
						if ( this.settings.resultSnippetBehaviour.titleInNewTab ) {
							anchor.target = '_blank';
						}
						anchor.appendChild( title );
						title = anchor;
					}
					this.rootElement.appendChild( title );
				}
				resolve( true );
			} );
		},
		description: () =>
		{
			const NAME = 'description';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements[ NAME ];
				if ( tag ) {
					let descText = this.startovacData.description;
					if ( ( !descText && this.settings.isPatron ) || this.settings.resultSnippetBehaviour.useOnlyPatronDefaultDescription ) {
						descText = this.settings.texts.patronDefaultDescription;
					}

					if ( descText ) {
						const description = document.createElement( tag );
						description.appendChild( document.createTextNode( descText ) );
						this.rootElement.appendChild( description );
					}
				}
				resolve( true );
			} );
		},
		meter: () =>
		{
			const NAME = 'meter';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements[ NAME ];
				if ( tag ) {

					/** @type {HTMLMeterElement} */
					const meter = ( document.createElement( tag ) );

					meter.min = 0;
					meter.max = this.startovacData.goal;
					meter.value = this.startovacData.pledged;
					this.recountMeterSettingsBy( meter );
					if ( this.settings.resultSnippetBehaviour[ NAME ].low ) {
						meter.low = this.settings.resultSnippetBehaviour[ NAME ].low;
					}
					if ( this.settings.resultSnippetBehaviour[ NAME ].high ) {
						meter.high = this.settings.resultSnippetBehaviour[ NAME ].high;
					}
					if ( this.settings.resultSnippetBehaviour[ NAME ].optimum ) {
						meter.optimum = this.settings.resultSnippetBehaviour[ NAME ].optimum;
					}
					//meter.title = this.startovacData.currency_symbol;
					meter.appendChild( document.createTextNode( this.startovacData.percent_fulfillment + ' %' + this.settings.texts.percentDone ) );
					this.rootElement.appendChild( meter );
				}
				resolve( true );
			} );
		},
		percentText: () =>
		{
			const NAME = 'percentText';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements[ NAME ];
				if ( tag ) {
					const container = document.createElement( tag );
					const span = document.createElement( StartovacWidgeticPrivate.SPAN_NODE_NAME );
					span.appendChild( document.createTextNode( this.startovacData.percent_fulfillment + ' %' ) );
					container.appendChild( span );
					container.appendChild( document.createTextNode( this.settings.texts.percentDone ) );
					this.rootElement.appendChild( container );
				}
				resolve( true );
			} );
		},
		countdownText: () =>
		{
			const NAME = 'countdownText';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements[ NAME ];
				if ( tag && !this.settings.isPatron ) {
					// @todo
				}
				resolve( true );
			} );
		},
		supportLink: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{

				/** @type {HTMLAnchorElement} */
				const anchor = ( document.createElement( StartovacWidgeticPrivate.HTML_ANCHOR_ELEMENT ) );

				anchor.href = this.startovacData.urls.startovac_project_url_pledge;
				anchor.rel = 'sponsored';
				if ( this.settings.resultSnippetBehaviour.supportInNewTab ) {
					anchor.target = '_blank';
				}
				anchor.appendChild( document.createTextNode( this.settings.texts.support ) );
				this.rootElement.appendChild( anchor );
				resolve( true );
			} );
		},
		moneyCollected: () =>
		{
			const NAME = 'moneyCollected';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements[ NAME ];
				if ( tag ) {
					const container = document.createElement( tag );
					const span = document.createElement( StartovacWidgeticPrivate.SPAN_NODE_NAME );
					let textContent = this.startovacData.pledged ? this.startovacData.pledged : '0';
					textContent += ' ' + this.startovacData.currency_symbol;
					span.appendChild( document.createTextNode( textContent ) );
					container.appendChild( span );
					container.appendChild( document.createTextNode( this.settings.texts.pledged ) );
					this.rootElement.appendChild( container );
				}
				resolve( true );
			} );
		},
		nSupporters: () =>
		{
			const NAME = 'nSupporters';
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const tag = this.settings.resultSnippetElements[ NAME ];
				if ( tag ) {
					const container = document.createElement( tag );
					container.appendChild( document.createTextNode( this.settings.texts[ NAME ] ) );

					/** @type {HTMLAnchorElement} */
					const anchor = ( document.createElement( StartovacWidgeticPrivate.HTML_ANCHOR_ELEMENT ) );

					if ( this.settings.resultSnippetBehaviour.nSupportersInNewTab ) {
						anchor.target = '_blank';
					}
					anchor.href = this.startovacData.urls.startovac_project_url + this.settings.resultSnippetBehaviour.nSupportersUrlSuffix;
					anchor.appendChild( document.createTextNode( this.startovacData.backers_count > this.startovacData.pledge_count ? this.startovacData.backers_count : this.startovacData.pledge_count + this.settings.texts.backersPlural ) );
					container.appendChild( anchor );
					this.rootElement.appendChild( container );
				}
				resolve( true );
			} );
		},
	}

}

/**
* @public
* @module StartovacWidgetic
* @classdesc Widget pro zobrazení Startovač projektu na vlastním webu
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/startovac-widgetic
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q1 2020
* @version 0.5
*/
export class StartovacWidgetic
{

	/**
	 * @private
	 * @description '#private' is not currently supported by Firefox, so that's why '_private'
	 */
	_private;

	/**
	* @public
	* @description names of cache items stored in localStorage
	*/
	cacheNames = {
		timestamp: 'StartovacWidgetic.cacheTimestamp',
		data: 'StartovacWidgetic.cachedData',
	}

	/**
	* @public
	* @description colors used for browser's console output
	*/
	static CONSOLE = {
		CLASS_NAME: 'color: gray',
		METHOD_NAME: 'font-weight: normal; color: green',
		INTEREST_PARAMETER: 'font-weight: normal; font-size: x-small; color: blue',
		EVENT_TEXT: 'color: orange',
		WARNING: 'color: red',
	};

	constructor ( /** @type {HTMLScriptElement | null} */ settingsElement = null )
	{
		console.groupCollapsed( '%c StartovacWidgetic',
			StartovacWidgetic.CONSOLE.CLASS_NAME
		);
		console.debug( '%c' + 'constructor',
			StartovacWidgetic.CONSOLE.METHOD_NAME,
			[ { arguments } ]
		);

		this._private = new StartovacWidgeticPrivate;

		/** @type {Object} */
		const settings = settingsElement ? JSON.parse( settingsElement.text ) : null;

		this._private.initImportWithIntegrity( settings ).then( () =>
		{
			if ( settings ) {
				this.setSettings( settings ).then( () =>
				{
					if ( this.settings.autoRun ) {
						this.run();
					}
				} );
			} else if ( this.settings.autoRun ) {
				this.run();
			}
		} );
		console.groupEnd();
	}


	set rootElement ( /** @type {HTMLElement} */ htmlElement )
	{
		this._private.rootElement = htmlElement;
	}

	/**
	 * @description : get root element
	 * @returns {HTMLElement} root element
	 */
	get rootElement ()
	{
		return this._private.rootElement;
	}

	/**
	 * @description : get script settings
	 * @returns {Object} settings of self
	 */
	get settings ()
	{
		return this._private.settings;
	}

	/**
	 * @description : Get dynamic Import function
	 * @returns {Function}
	 */
	get importWithIntegrity ()
	{
		return this._private.importWithIntegrity;
	}

	get elCreator ()
	{
		return this._private.elCreator;
	}

	/**
	 * @returns {Object}
	 */
	get startovacData ()
	{
		return this._private.startovacData;
	}

	set startovacData ( /** @type {Object} */ startovacData )
	{
		this._private.startovacData = startovacData;
	}


	async setSettings ( /** @type {Object} */ inObject )
	{
		console.groupCollapsed( '%c StartovacWidgetic %c setSettings',
			StartovacWidgetic.CONSOLE.CLASS_NAME,
			StartovacWidgetic.CONSOLE.METHOD_NAME
		);
		console.debug( { arguments } );
		console.groupEnd();

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			if ( inObject.modulesImportPath ) {
				this.settings.modulesImportPath = inObject.modulesImportPath;
			}
			this.importWithIntegrity(
				this.settings.modulesImportPath + '/object/deepAssign.mjs',
				'sha256-qv6PwXwb5wOy4BdBQVGgGUXAdHKXMtY7HELWvcvag34='
			).then( ( /** @type {Module} */ deepAssign ) =>
			{
				new deepAssign.append( Object );
				this._private.settings = Object.deepAssign( this.settings, inObject ); // multi level assign
				resolve( true );
			} ).catch( () =>
			{
				Object.assign( this._private.settings, inObject ); // single level assign
				resolve( true );
			} );
		} );
	}

	showResult ()
	{
		console.debug( '%c StartovacWidgetic %c showResult',
			StartovacWidgetic.CONSOLE.CLASS_NAME,
			StartovacWidgetic.CONSOLE.METHOD_NAME
		);

		this.rootElement.hidden = false;
	}

	async prepareVirtualDom ()
	{
		console.debug( '%c StartovacWidgetic %c prepareVirtualDom',
			StartovacWidgetic.CONSOLE.CLASS_NAME,
			StartovacWidgetic.CONSOLE.METHOD_NAME
		);

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			this.settings.structure.forEach( ( /** @type {String} */ method ) =>
			{
				if ( method in this.elCreator ) {
					this.elCreator[ method ]();
				}
			} );
			resolve( true );
		} );
	}

	constructApiUrls ()
	{
		const BASE_JSON = '/json';
		const POSSIBLE_FORMS = [ BASE_JSON, 'json/' ];
		if ( this.settings.projectURL.constructor.name === StartovacWidgeticPrivate.TYPE_STRING ) {
			this.settings.projectURL = new URL( this.settings.projectURL );
		}
		const slug = this.settings.projectURL.href.substr( this.settings.projectURL.href.length - BASE_JSON.length );
		if ( !POSSIBLE_FORMS.includes( slug ) ) {
			this.settings.projectURL.href += BASE_JSON;
		}
	}

	determinePatron ()
	{
		const PATRON_IDENT_SUBSTRING = '/patron/';
		if ( this.settings.isPatron === null ) {
			this.settings.isPatron = this.settings.projectURL.href.includes( PATRON_IDENT_SUBSTRING );
		}
	}

	checkReturnedData ()
	{
		if ( this.startovacData.constructor.name !== StartovacWidgeticPrivate.TYPE_OBJECT ) {
			throw 'Fetching data from Startovač failed';
		}
	}

	useClientCachedResource ()
	{
		if ( this.settings.clientCacheFor && this.settings.clientCacheFor > 0 ) {
			const cacheTimestamp = localStorage.getItem( this.cacheNames.timestamp );
			if ( cacheTimestamp && Number( cacheTimestamp ) > Date.now() - this.settings.clientCacheFor * 1000 ) {
				return true;
			}
		}
		return false;
	}

	async fetchFromAPI ()
	{
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			if ( this.useClientCachedResource() ) {
				this.startovacData = JSON.parse( localStorage.getItem( this.cacheNames.data ) );
				resolve( true );
				return true;
			}

			fetch( this.settings.projectURL.href, {
				method: 'GET',
				credentials: 'omit',
				cache: 'no-cache',
				referrerPolicy: 'no-referrer',
				redirect: 'follow',
				mode: 'cors'
			} ).then( ( /** @type {Response} */ response ) =>
			{
				if ( response.ok ) {
					return response.text();
				}
				return null;
			} ).then( ( /** @type {String} */ json ) =>
			{
				this.startovacData = JSON.parse( json );
				localStorage.setItem( this.cacheNames.timestamp, String( Date.now() ) );
				localStorage.setItem( this.cacheNames.data, JSON.stringify( this.startovacData ) );
				resolve( true );
			} )
		} );
	}

	async addCSSStyleSheets ()
	{
		console.debug( '%c StartovacWidgetic %c addCSSStyleSheets',
			StartovacWidgetic.CONSOLE.CLASS_NAME,
			StartovacWidgetic.CONSOLE.METHOD_NAME
		);

		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			const usedStyleSheets = new Set();
			[ ...document.styleSheets ].forEach( ( /** @type {CSSStyleSheet} */ css ) =>
			{
				if ( css.disabled === false ) {
					usedStyleSheets.add( css.href );
				}
			} );
			this.settings.CSSStyleSheets.forEach( ( /** @type {Object} */ assignment ) =>
			{
				let url = URL;
				if ( assignment.href.startsWith( 'https://', 0 ) || assignment.href.startsWith( 'http://', 0 ) ) {
					url = new URL( assignment.href );
				} else {
					url = new URL( assignment.href, window.location.protocol + '//' + window.location.hostname );
				}
				if ( !usedStyleSheets.has( url.href ) ) {
					fetch( url.href, {
						method: 'HEAD',
						credentials: 'omit',
						cache: 'force-cache',
						referrerPolicy: 'no-referrer',
						redirect: 'manual',
						mode: 'cors'
					} ).then( ( /** @type {Response} */ response ) =>
					{
						if ( response.ok ) {
							return true;
						} else {
							throw 'error';
						}
					} ).then( () =>
					{
						/** @type {HTMLLinkElement} */
						const link = document.createElement( StartovacWidgeticPrivate.LINK_NODE_NAME );

						link.href = url.href;
						link.rel = 'stylesheet';
						link.setAttribute( 'crossorigin', 'anonymous' );
						if ( assignment.integrity ) {
							link.integrity = assignment.integrity;
						}
						document.head.appendChild( link );
					} ).catch( () =>
					{
						resolve( false );
					} );
				}
			} );
			resolve( true );
		} );
	}

	initRootElement ()
	{
		console.debug( '%c StartovacWidgetic %c initRootElement',
			StartovacWidgetic.CONSOLE.CLASS_NAME,
			StartovacWidgetic.CONSOLE.METHOD_NAME
		);

		this.rootElement = document.getElementById( this.settings.rootElementId );
	}

	checkRequirements ()
	{
		console.debug( '%c StartovacWidgetic %c checkRequirements',
			StartovacWidgetic.CONSOLE.CLASS_NAME,
			StartovacWidgetic.CONSOLE.METHOD_NAME
		);

		if ( !this.settings.projectURL ) {
			throw new Error( 'Project URL on Startovač server is missing.' );
		}
	}

	run ()
	{
		console.groupCollapsed( '%c StartovacWidgetic %c run',
			StartovacWidgetic.CONSOLE.CLASS_NAME,
			StartovacWidgetic.CONSOLE.METHOD_NAME
		);

		this.checkRequirements();
		this.addCSSStyleSheets();
		this.initRootElement();
		this.constructApiUrls();
		this.fetchFromAPI().then( () =>
		{
			this.checkReturnedData();
			this.determinePatron();
			this.prepareVirtualDom();
			this.showResult();
		} );

		console.groupEnd();

		return true;
	}
};

new StartovacWidgetic( document.getElementById( 'startovac-widgetic-settings' ) );
