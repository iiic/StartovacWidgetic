/**
* @private
* @module StartovacWidgeticPrivate
* @classdesc Privátní část vlastního widgetu pro Startovač… s nastavením, to je důležité.
* @author ic < ic.czech@gmail.com >
* @see https://iiic.dev/startovac-widgetic
* @license https://creativecommons.org/licenses/by-sa/4.0/legalcode.cs CC BY-SA 4.0
* @since Q1 2020
* @version 0.4
* @readonly
*/
const StartovacWidgeticPrivate = class
{

	/**
	 * @public
	 * @type {Object}
	 * @description default settings… can be overwritten
	 */
	settings = {
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
		resultSnippetElements: {
			title: 'STRONG',
			description: 'P',
			picture: 'PICTURE',
			meter: 'METER',
			percentText: 'P',
			nSupporters: 'P',
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
			alreadyContributed: 'Již přispělo ',
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
	rootElement = document.getElementById( 'startovac-canvas' );

	/**
	 * @public
	 * @type {URL}
	 */
	projectURL = new URL( 'https://www.startovac.cz/patron/vedator/json' );

	/**
	* @public
	* @type {Object}
	*/
	startovacData = Object;


	elCreator = {
		picture: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const el = this.settings.resultSnippetElements.picture;
				if ( el ) {

					/** @type {HTMLImageElement} */
					let img = ( document.createElement( 'IMG' ) );

					img.src = this.startovacData.photo.small_image;
					img.alt = this.settings.texts.pictureAlt ? this.settings.texts.pictureAlt : this.startovacData.name;

					if ( el === 'PICTURE' ) {

						/** @type {HTMLPictureElement} */
						const picture = ( document.createElement( 'PICTURE' ) );

						picture.appendChild( img );
						//@ts-ignore
						img = picture;
					} else if ( el === 'FIGURE' ) {
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
					this.rootElement.appendChild( document.createElement( 'BR' ) );
				}
				resolve( true );
			} );
		},
		title: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const el = this.settings.resultSnippetElements.title;
				if ( el ) {
					let title = document.createElement( el );
					title.appendChild( document.createTextNode( this.startovacData.name ) );
					if ( this.settings.resultSnippetBehaviour.titleIsLink ) {

						/** @type {HTMLLinkElement} */
						const link = ( document.createElement( 'A' ) );

						link.href = this.startovacData.urls.startovac_project_url;
						if ( this.settings.resultSnippetBehaviour.titleInNewTab ) {
							link.target = '_blank';
						}
						link.appendChild( title );
						title = link;
					}
					this.rootElement.appendChild( title );
				}
				resolve( true );
			} );
		},
		description: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const el = this.settings.resultSnippetElements.description;
				if ( el ) {
					let descText = this.startovacData.description;
					if ( ( !descText && this.settings.isPatron ) || this.settings.resultSnippetBehaviour.useOnlyPatronDefaultDescription ) {
						descText = this.settings.texts.patronDefaultDescription;
					}

					if ( descText ) {
						const description = document.createElement( el );
						description.appendChild( document.createTextNode( descText ) );
						this.rootElement.appendChild( description );
					}
				}
				resolve( true );
			} );
		},
		recountMeterSettingsBy: ( /** @type {HTMLMeterElement} */ meter ) =>
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
					if ( typeof val === 'string' ) {
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
		},
		meter: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const el = this.settings.resultSnippetElements.meter;
				if ( el ) {

					/** @type {HTMLMeterElement} */
					const meter = ( document.createElement( el ) );

					meter.min = 0;
					meter.max = this.startovacData.goal;
					meter.value = this.startovacData.pledged;
					this.elCreator.recountMeterSettingsBy( meter );
					if ( this.settings.resultSnippetBehaviour.meter.low ) {
						meter.low = this.settings.resultSnippetBehaviour.meter.low;
					}
					if ( this.settings.resultSnippetBehaviour.meter.high ) {
						meter.high = this.settings.resultSnippetBehaviour.meter.high;
					}
					if ( this.settings.resultSnippetBehaviour.meter.optimum ) {
						meter.optimum = this.settings.resultSnippetBehaviour.meter.optimum;
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
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const el = this.settings.resultSnippetElements.percentText;
				if ( el ) {
					const container = document.createElement( el );
					const span = document.createElement( 'SPAN' );
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
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const el = this.settings.resultSnippetElements.countdownText;
				if ( el && !this.settings.isPatron ) {
					// @todo
				}
				resolve( true );
			} );
		},
		supportLink: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{

				/** @type {HTMLLinkElement} */
				const link = ( document.createElement( 'A' ) );

				link.href = this.startovacData.urls.startovac_project_url_pledge;
				link.rel = 'sponsored';
				if ( this.settings.resultSnippetBehaviour.supportInNewTab ) {
					link.target = '_blank';
				}
				link.appendChild( document.createTextNode( this.settings.texts.support ) );
				this.rootElement.appendChild( link );
				resolve( true );
			} );
		},
		moneyCollected: () =>
		{
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const el = this.settings.resultSnippetElements.percentText;
				if ( el ) {
					const container = document.createElement( el );
					const span = document.createElement( 'SPAN' );
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
			return new Promise( ( /** @type {Function} */ resolve ) =>
			{
				const el = this.settings.resultSnippetElements.nSupporters;
				if ( el ) {
					const container = document.createElement( el );
					container.appendChild( document.createTextNode( this.settings.texts.alreadyContributed ) );

					/** @type {HTMLLinkElement} */
					const link = ( document.createElement( 'A' ) );

					if ( this.settings.resultSnippetBehaviour.nSupportersInNewTab ) {
						link.target = '_blank';
					}
					link.href = this.startovacData.urls.startovac_project_url + this.settings.resultSnippetBehaviour.nSupportersUrlSuffix;
					link.appendChild( document.createTextNode( this.startovacData.backers_count > this.startovacData.pledge_count ? this.startovacData.backers_count : this.startovacData.pledge_count + this.settings.texts.backersPlural ) );
					container.appendChild( link );
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
* @version 0.4
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

	constructor (
		/** @type {URL | String | null} */ projectURL = null,
		/** @type {HTMLElement | null} */ rootElement = null,
		/** @type {Object | null} */ settings = null
	)
	{
		this._private = new StartovacWidgeticPrivate;

		if ( projectURL ) {
			//@ts-ignore
			this.projectURL = projectURL;
		}
		if ( rootElement ) {
			this.rootElement = rootElement;
		}
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

	// @ts-ignore
	set projectURL ( /** @type {String | URL} */ url )
	{
		if ( typeof url === 'string' ) {
			url = new URL( url );
		}
		this._private.projectURL = url;
	}

	/**
	 * @returns {URL}
	 */
	//@ts-ignore
	get projectURL ()
	{
		return this._private.projectURL;
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
		return new Promise( ( /** @type {Function} */ resolve ) =>
		{
			if ( inObject.modulesImportPath ) {
				this.settings.modulesImportPath = inObject.modulesImportPath;
			}
			// @ts-ignore
			import( this.settings.modulesImportPath + '/object/deepAssign.mjs' ).then( ( /** @type {Module} */ deepAssign ) =>
			{
				new deepAssign.append( Object );
				// @ts-ignore
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
		this.rootElement.hidden = false;
	}

	async prepareVirtualDom ()
	{
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

	checkProjectUrl ()
	{
		const BASE_JSON = '/json';
		const POSSIBLE_FORMS = [ BASE_JSON, 'json/' ];
		const slug = this.projectURL.href.substr( this.projectURL.href.length - BASE_JSON.length );
		if ( !POSSIBLE_FORMS.includes( slug ) ) {
			this.projectURL.href += BASE_JSON;
		}
	}

	determinePatron ()
	{
		const PATRON_IDENT_SUBSTRING = '/patron/';
		if ( this.settings.isPatron === null ) {
			this.settings.isPatron = this.projectURL.href.includes( PATRON_IDENT_SUBSTRING );
		}
	}

	checkReturnedData ()
	{
		if ( typeof this.startovacData !== 'object' ) {
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

			fetch( this.projectURL.href, { cache: 'no-cache' } ).then( ( /** @type {Response} */ response ) =>
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

	run ()
	{
		this.checkProjectUrl();
		this.fetchFromAPI().then( () =>
		{
			this.checkReturnedData();
			this.determinePatron();
			this.prepareVirtualDom();
			this.showResult();
		} );

		return true;
	}
};
