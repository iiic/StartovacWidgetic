# StartovacWidgetic
Widget pro zobrazení Startovač projektu na vlastním webu

V podstatě obdoba takového okénka od Startovače https://www.startovac.cz/novinky/detail/1222/ jen bez toho iframe, document.write() a dalších nepěkných věcí.

# Jak na to?

Potřebný je tu jediný soubor a to `startovacWidgetic.mjs`. Ten vložit do stránky a spustit takto nějak:

``` html
	<div id="startovac-canvas" hidden></div>
	<script type="module" src="/startovacWidgetic.mjs" crossorigin="anonymous" integrity="sha256-eRG0Ii75Q7xFuQ7BpfTGrQGNud5R39jxK6R9ini0OtA="></script>
	<script type="module">
		import { StartovacWidgetic } from '/startovacWidgetic.mjs';
		const projectURL = new URL( 'https://www.startovac.cz/patron/vedator/' ); // váš projekt na Startovači
		const sandboxElement = document.getElementById('startovac-canvas'); // kam se to vykreslí
		new StartovacWidgetic( projectURL, sandboxElement );
	</script>
```

minimalistický příklad použití s nastavením je v souboru `example-usage.html` a příklad jak by mohly vypadat styly v souboru `example.css`.

# možné problémy?

mjs přípona musí mít nastavený správný mime type a to `text/javascript`, pokud je to moc pracné přejmenujte koncovku z .mjs na .js

-------

Nějaké další info na https://iiic.dev/startovac-widgetic 