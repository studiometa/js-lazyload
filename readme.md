## Utilisation


```html
<img class="js-lazy"
	src="blank.gif"
	data-src-large="image@large.jpg"
	data-src-medium="image@medium.jpg"
	data-src-small="image@small.jpg"
	data-src="image.jpg">

<div class="js-lazy"
	data-src-large="image@large.jpg"
	data-src-medium="image@medium.jpg"
	data-src-small="image@small.jpg"
	data-src="image.jpg">
</div>
```

```js
var lazy = new Lazy({
	src: 'data-src',
	selector: '.js-lazy',
	separator: ' | ',
	breakpoints: [
		{
			width : 1300,
			src   : 'data-src-large'
		},
		{
			width : 1000,
			src   : 'data-src-medium'
		},
		{
			width : 600,
			src   : 'data-src-small'
		}
	],
	offset: window.innerHeight/2,
	onError: function() {},
	errorClass: 'has-error',
	onSuccess: function() {},
	successClass: 'is-loaded'
});
```