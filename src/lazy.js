/**
 * Adaptation of bLazy
 * @param {object} options the instance options
 */
Lazy = function(options) {
	'use strict';

	if (!(this instanceof Lazy)) return new Lazy(options);
	var _ = this;

	// Set defaults options
	_.options = {
		src: 'data-src',
		selector: '.js-lazy',
		separator: ' | ',
		breakpoints: [],
		offset: 100,
		onError: null,
		errorClass: 'has-error',
		onSuccess: null,
		successClass: 'is-loaded'
	};

	// Extend options
	$.extend(true, _.options, options);
	var opts = _.options;


	// Init vars
	var images = [];
	var source = opts.src;
	var isRetina = window.devicePixelRatio > 1;
	var viewWidth = window.innerWidth;
	var viewHeight = window.innerHeight;


	/**
	 * Validate if an image is in view
	 * @return {undefined}
	 */
	_.validate = function() {

		_.$images.each(function(i, el) {
			var $this = $(this);
			if (_.isInViewport(this) || $this.hasClass(opts.successClass)) {
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

		var $el = $(el);
		// Get the correct attribute
		var dataSrc = $el.attr(source) || $el.attr(opts.src);

		// Return if element is not visible or has no data-src
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
	 * Check if an element is in the viewport
	 * @param  {object} el The element to test
	 * @return {boolean}   If the element is in viewport or not
	 */
	_.isInViewport = function(el) {
		var pos = el.getBoundingClientRect();
		var bottomline = viewHeight + opts.offset;
		return pos.top >= 0 && pos.top <= bottomline || pos.bottom <= bottomline && pos.bottom >= 0 - opts.offset;
	};


	/**
	 * Update sizing vars
	 * @return {undefined}
	 */
	function updateSizes() {
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
	 * Launch the stuff
	 * @return {undefined}
	 */
	_.init = function() {
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
			$(window).on({
				resize: _.updateSizesT,
				resize: _.validateT,
				scroll: _.validateT
			});
		}
		// And finally, we start to lazy load.
		_.validate();
	};

	// Init lazyload on window load
	$(window).on('load', function() {
		_.init();
	});

	return _;
};


/**
 * Public functions
 */
Lazy.prototype = {

	/**
	 * Revalidate lazyload
	 * @return {undefined}
	 */
	revalidate: function() {
		var _ = this;
		if (!_.destroyed) _.validate();
	},

	/**
	 * Re-init the lazyload with new elements
	 * Usefule when new images have been added via AJAX
	 * @return {undefined}
	 */
	reInit: function() {
		var _ = this;

		// Update the images object with the new images, but not the one alreayd loaded
		_.$images = $(_.options.selector).not('.'+_.options.successClass);

		// If we have images, revalidate
		if (_.$images) {
			_.destroyed = false;
			_.revalidate();
		}
	},

	/**
	 * Destroy Lazy, unbind events
	 * @return {undefined}
	 */
	destroy: function() {
		var _ = this;
		_.destroyed = true;

		$(window).off({
			resize: _.updateSizesT,
			resize: _.validateT,
			scroll: _.validateT
		});
		_.$images = null;
	}

};