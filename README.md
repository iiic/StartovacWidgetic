# StartovacWidgetic v 0.3
Widget pro zobrazení Startovač projektu na vlastním webu

V podstatě obdoba takového okénka od Startovače https://www.startovac.cz/novinky/detail/1222/ jen bez toho iframe, document.write() a dalších nepěkných věcí.

vypadat může třeba takto:

![Ukazka](https://iiic.dev/images/startovac-widgetic-snapshot.png)

# Jak na to?

Potřebný je tu jediný soubor a to `startovacWidgetic.mjs`. Ten vložit do stránky a spustit takto nějak:

``` html
	<div id="startovac-canvas" hidden></div>
	<script type="module" src="/startovacWidgetic.mjs" crossorigin="anonymous" integrity="sha256-S2uum/79mzg8OUYejkEsGIoe4mfsWQb0Ab1qD+I4tYw="></script>
	<script type="module">
		import { StartovacWidgetic } from '/startovacWidgetic.mjs';
		const projectURL = new URL( 'https://www.startovac.cz/patron/vedator/' ); // váš projekt na Startovači
		const sandboxElement = document.getElementById('startovac-canvas'); // kam se to vykreslí
		new StartovacWidgetic( projectURL, sandboxElement );
	</script>
```

Není celý kód `	<script type="module" src="/startovacWidgetic.mjs" crossorigin="anonymous" integrity="sha256-S2uum/79mzg8OUYejkEsGIoe4mfsWQb0Ab1qD+I4tYw="></script>` zbytečný, fungovalo by to i bez něj. Jops, fungovalo, ale nešlo by bez něj zajistit kontrolu integrity javascriptového modulu. Bezpečnost je důležitá, pokud vás zajímá o bezpečnosti modulů více, čtěte zde: https://iiic.dev/subresource-integrity-check-u-javascriptovych-modulu

minimalistický příklad použití s nastavením je v souboru `example-usage.html` a příklad jak by mohly vypadat styly v souboru `example.css`.

# Nastavení

Je možné provést 3. parametrem konstruktoru.

# Možné problémy?

mjs přípona musí mít nastavený správný mime type a to `text/javascript`, pokud je to moc pracné přejmenujte koncovku z .mjs na .js . Více o modulech na https://www.vzhurudolu.cz/prirucka/js-moduly

# API přístupové body pro CSP

Pro nezbytnou funkci widgetu je potřeba komunikovat s doménou startovac.cz .
Restriktivní CSP tedy například takto: `connect-src https://www.startovac.cz/` a `img-src https://www.startovac.cz/cache/images/` pokud zobrazujete obrázek.

# Licence

**CC BY-SA 4.0**

This work is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License. To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.

-------

Nějaké další info na https://iiic.dev/startovac-widgetic
