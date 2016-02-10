var Lazy = Lazy || {};

(function() {
	'use strict';

	var _, opts, images, source;
	var isRetina = window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.5), only screen and (min--moz-device-pixel-ratio: 1.5), only screen and (min-resolution: 240dppx)').matches;
	var viewWidth = window.innerWidth;
	var viewHeight = window.innerHeight;
	var $window = $(window);

	/**
	 * Adaptation of bLazy
	 * @param {object} options the instance options
	 */
	Lazy = function(options) {
		console.log('lazy');

		if (!(this instanceof Lazy)) return new Lazy(options);
		_ = this;

		// Set defaults options
		_.options = {
			src: 'data-src',
			selector: '.js-lazy',
			separator: ' | ',
			breakpoints: [
				{
					width : 1440,
					src   : 'data-src-larger'
				},
				{
					width : 1280,
					src   : 'data-src-large'
				},
				{
					width : 992,
					src   : 'data-src-medium'
				},
				{
					width : 768,
					src   : 'data-src-small'
				},
				{
					width : 480,
					src   : 'data-src-smaller'
				}
			],
			offset: window.innerHeight/2,
			onError: function() {},
			errorClass: 'has-error',
			onSuccess: function() {},
			successClass: 'is-loaded'
		};

		// Extend options
		$.extend(true, _.options, options);
		opts = _.options;

		// Init vars
		images = [];
		source = opts.src;


		/**
		 * Validate if an image is in view
		 * @return {undefined}
		 */
		_.validate = function(force) {
			console.log('lazy:validate');

			_.$images.each(function(i, el) {
				var $this = $(this);
				if ((isInViewport(this) || $this.hasClass(opts.successClass)) || force) {
					_.load(this);
				}
			});

			if (images.length === 0) {
				_.destroy();
				return false;
			}
		};


		/**
		 * Load an image
		 * @param  {object} el The image to load
		 * @return {undefined}
		 */
		_.load = function(el) {
			console.log('lazy:load');

			var $el = $(el);
			// Get the correct attribute
			var dataSrc = $el.attr(source) || $el.attr(opts.src);

			// Return if element is not visible or has no data-src
			// console.log(el.offsetWidth === 0 && el.offsetHeight === 0 || !dataSrc, el.alt)
			if (!dataSrc) return;

			// Here the fun begins
			var dataSrcSplitted = dataSrc.split(opts.separator);
			var src = dataSrcSplitted[isRetina && dataSrcSplitted.length > 1 ? 1 : 0];
			var img = new Image();

			// cleanup markup, remove data source attributes
			$.each(opts.breakpoints, function(i, el) {
				$el.removeAttr(el.src);
			});
			$el.removeAttr(opts.src);

			img.onerror = function() {
				if (opts.onError) opts.onError(el, 'invalid');
				$el.addClass(opts.errorClass);
			};

			img.onload = function() {
				// Is element an image or should we add the src as a background image?
				if (el.nodeName.toLowerCase() === 'img') {
					el.src = src;
				} else if (el.nodeName.toLowerCase() === 'image') {
					var newEl = document.createElementNS('http://www.w3.org/2000/svg', 'image');
					newEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', src);
					newEl.setAttribute('x', el.getAttribute('x'));
					newEl.setAttribute('y', el.getAttribute('y'));
					newEl.setAttribute('width', el.width.baseVal.value);
					newEl.setAttribute('height', el.height.baseVal.value);
					el.parentNode.appendChild(newEl);
					el.remove();
				} else {
					$el.css('background-image', 'url("' + src + '")');
				}

				$el.addClass(opts.successClass);
				if (opts.onSuccess) opts.onSuccess(el);
			};
			img.src = src; // preload image

			// Remove image from array when loaded
			images.splice($.inArray(el, images), 1);
		};


		/**
		 * Launch the stuff
		 * @return {undefined}
		 */
		_.init = function() {
			console.log('lazy:init');

			_.destroyed = true;
			_.$images = $(opts.selector);
			// Push images to the images array
			_.$images.each(function(i, el) {
				images.push(this);
			});

			updateSizes();

			// Create throttle functions
			_.validateT = throttle(_.validate, 250);
			_.updateSizesT = throttle(updateSizes, 500);

			_.updateAndValidateT = function() {
				_.updateSizesT();
				_.validateT();
			};

			// Use the right source based on viewport width
			$.each(opts.breakpoints, function(i, el) {
				if (el.width <= viewWidth) {
					source = el.src;
					return false;
				}
			});

			// Then we bind resize and scroll events if not already binded
			if (_.destroyed) {
				_.destroyed = false;
				$window.on({
					resize: _.updateAndValidateT,
					scroll: _.validateT
				});
			}
			// Start to test for validation
			_.validate();
		};

		return _;
	};



	/**
	 * Check if an element is in the viewport
	 * @param  {object} el The element to test
	 * @return {boolean}   If the element is in viewport or not
	 */
	function isInViewport(el) {
		console.log('lazy:isInViewport');

		var pos = el.getBoundingClientRect();
		var bottomline = viewHeight + opts.offset;
		return pos.top >= 0 && pos.top  <= bottomline || pos.bottom <= bottomline && pos.bottom >= 0 - opts.offset;
	}


	/**
	 * Update sizing vars
	 * @return {undefined}
	 */
	function updateSizes() {
		console.log('lazy:updateSizes');
		viewWidth = window.innerWidth || document.documentElement.clientWidth;
		viewHeight = window.innerHeight || document.documentElement.clientHeight;
	}

	/**
	 * Private throttle function
	 * @param  {function} fn       The function to call
	 * @param  {number}   minDelay The throttle delay
	 * @return {function}          A function which fires every {minDelay}ms
	 */
	function throttle(fn, minDelay) {
		console.log('lazy:throttle');
		var lastCall = 0;
		return function() {
			var now = +new Date();
			if (now - lastCall < minDelay) {
				return;
			}
			lastCall = now;
			fn();
		};
	}



	/**
	 * Revalidate lazyload
	 * @return {undefined}
	 */
	Lazy.prototype.revalidate = function(force) {
		console.log('lazy:revalidate');
		if (!_.destroyed) _.validate(force);
	};



	/**
	 * Re-init the lazyload with new elements
	 * @return {undefined}
	 */
	Lazy.prototype.reInit = function() {
		console.log('lazy:reInit');

		// Update the images object with the new images, but not the one alreayd loaded
		_.$images = $(_.options.selector).not('.'+_.options.successClass);

		// If we have images, revalidate
		if (_.$images) {
			_.destroyed = false;
			_.revalidate();
		}

		return _;
	};



	/**
	 * Destroy Lazy, unbind events
	 * @return {undefined}
	 */
	Lazy.prototype.destroy = function() {
		console.log('lazy:destroy');
		_.destroyed = true;

		$window.off({
			resize: _.updateAndValidateT,
			scroll: _.validateT
		});
		_.$images = null;
	};

}());