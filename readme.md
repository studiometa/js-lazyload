# Loader

Petit script pour simuler un loader en chargeant un groupe d'images les unes après les autres. Il permet d'éxécuter un _callback_ au chargement de chaque image et au chargement de toutes les images.

Utilisé pour le _loader_ de [Signes du quotidien](http://signesduquotidien.org/).

## Utilisation

```js
var images = [
	'<img data-src="image.jpg">',
	'<img data-src="image.jpg">',
	'<img data-src="image.jpg">',
	'<img data-src="image.jpg">',
	'<img data-src="image.jpg">',
	'<img data-src="image.jpg">',
	'<img data-src="image.jpg">'
];

var loader = new Loader(images, {
	attr: 'data-src',
	onImageLoad: function(percentage) {
		console.log(percentage);
	},
	onComplete: function() {
		console.log('Chargement terminé !');
	}
});
```