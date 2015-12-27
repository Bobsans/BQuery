/* @preserve
 * BQuery JS library v0.1 alpha
 * Simplest version of JQuery.
 * http://vk.com/b_o_b_s_a_n_s
 * by Bobsans
 */

(function(window, document) {
	var info = {
		'name': 'BQuery',
		'version': '0.1 aplha',
		'author': 'Bobsans'
	};

	var BQType = Object.freeze({
		SINGLENODE:      0,
		NODELIST:        1,
		HTMLCOLLECTION:  2,
		ARRAY:           3,
		WINDOW:          4
	});

	function BQError(message) {
	    this.name = 'BQError';
	    this.message = (message || '');
	}

	BQError.prototype = Error.prototype;

	// HELPER FUNCTIONS
	function addEventHandler(element, type, callback) {
		if (element.addEventListener)
			element.addEventListener(type, callback, false);
		else if (element.attachEvent)
			element.attachEvent("on" + type, callback);
	}

	function removeEventHandler(element, type) {
		if (element.removeEventListener)
			element.removeEventListener(type, false);
		else if (element.detachEvent)
			element.detachEvent('on' + type);
	}

	// CONSTRUCTOR
	function BQuery(element) {
		if(typeof(element) === 'string') {
			this.element = this.select(element);
			if(this.element && this.element.length == 1) {
				this.element = this.element[0];
				this.type = BQType.SINGLENODE;
			} else
				this.type = BQType.NODELIST;
		} else {
			this.element = element;

			if(element instanceof Element || element instanceof Node) {
				this.type = BQType.SINGLENODE;
			} else if(element instanceof NodeList) {
				this.type = BQType.NODELIST;
			} else if(element instanceof HTMLCollection) {
				this.type = BQType.HTMLCOLLECTION;
			} else if(element instanceof Array) {
				this.type = BQType.ARRAY;
			} else if(element instanceof Window) {
				this.type = BQType.WINDOW;
			} else {
				throw new BQError('Unknown input type');
			}
		}
	}

	// PROTOTYPE
	BQuery.prototype.applyfn = function(callback) {
		if(this.element) {
			if(this.type == BQType.SINGLENODE || this.type == BQType.WINDOW)
				callback(this.element);
			else
				[].forEach.call(this.element, callback);
		}
	};

	BQuery.prototype.get = function(id) {
		if(this.type == BQType.SINGLENODE || this.type == BQType.WINDOW)
			return new BQuery(this.element);
		else {
			try {
				return new BQuery(this.element[id]);
			} catch(e) {
				return undefined;
			}
		}
	};

	BQuery.prototype.find = function(selector) {
		console.log('FIND: [element: ' + this.element + ', selector: ' + selector + ', return: ' + (selector && this.element ? new BQuery(selector) : undefined) + ']');
		return selector && this.element ? new BQuery(selector) : undefined;
	};

	BQuery.prototype.select = function(selector) {
		console.log('SELECT: [element: ' + this.element + ', selector: ' + selector + ']');
		return selector ? (this.element || document).querySelectorAll(selector) : undefined;
	};

	BQuery.prototype.remove = function() {
		this.applyfn(function(el) {
			if(el.parentNode)
				el.parentNode.removeChild(el);
		});
	};

	BQuery.prototype.each = function(callback) {
		this.applyfn(callback);
		return this;
	};

	// custom functions
	BQuery.prototype.addClass = function(classname) {
		this.applyfn(function(el) {
			el.classList.add(classname);
		});
		return this;
	};

	BQuery.prototype.removeClass = function(classname) {
		this.applyfn(function(el) {
			el.classList.remove(classname);
		});
		return this;
	};

	BQuery.prototype.hasClass = function(classname) {
		return this.type == BQType.SINGLENODE ? this.element.classList.contains(classname) : false;
	};

	BQuery.prototype.toggleClass = function(classname) {
		this.applyfn(function(el) {
			el.classList.contains(classname) ? el.classList.remove(classname) : el.classList.add(classname);
		});
		return this;
	};

	BQuery.prototype.css = function(values) {
		this.applyfn(function(el) {
			for(property in values)
				el.style[property] = values[property];
		});
		return this;
	};

	BQuery.prototype.data = function(dataname, value) {
		if(typeof value !== 'undefined') {
			this.applyfn(function(el) {
				el.setAttribute('data-' + dataname, value);
			});
			return this;
		} else
			return this.element.getAttribute('data-' + dataname);
	};

	BQuery.prototype.val = function(value) {
		if(typeof value !== 'undefined') {
			this.applyfn(function(el) {
				el.value = value;
			});
			return this;
		} else
			return this.type == BQType.SINGLENODE ? this.element.value : undefined;
	};

	BQuery.prototype.html = function(html) {
		if(typeof html !== 'undefined') {
			this.applyfn(function(el) {
				el.innerHTML = html;
			});
			return this;
		} else
			return this.type == BQType.SINGLENODE ? this.element.innerHtml : undefined;
	};

	// node callbacks
	BQuery.prototype.on = function(event, callback, node) {
		var self = this;
		event.split(' ').forEach(function(ev) {
			self.applyfn(function(el) {
				addEventHandler(el, ev, callback);
			});
		});
	};

	BQuery.prototype.unon = function(event, node) {
		this.applyfn(function(el) {
			removeEventHandler(el, event);
		});
	};

	// callbacks
	BQuery.prototype.ready = function(callback) {
		addEventHandler(window, 'load', callback);
	};

	BQuery.prototype.ajax = function(data) {
		if(data && data.url) {
			function getXmlHttp() {
				var xmlhttp;
				try {
					xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
				} catch(e) {
					try {
						xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
					} catch (E) {
						xmlhttp = false;
					}
				}
				if (!xmlhttp && typeof XMLHttpRequest != 'undefined')
					xmlhttp = new XMLHttpRequest();
				return xmlhttp;
			}

			function contentTypeChange(type, data) {
				switch(type) {
					case 'json':
						try {
							return JSON.parse(data);
						} catch(e) {
							throw new BQError('AJAX Parse Error. Responsed content not valid json text. \n' + data)
						}
					default:
						return data;
						break;
				}
			}

			function formatBody(data) {
				var body = '';
				for(param in data)
					body += param + encodeURIComponent(data[param]) + '&';
				return body;
			}

			var contentTypes = {
				text: 'text/plain',
				html: 'text/html',
				xml:  'text/xml',
				json: 'application/json'
			};

			var data = {
				url:          data.url,
				method:       (data.method || 'get').toLowerCase(),
				type:         (data.type || 'text').toLowerCase(),
				statechanged: data.statechanged || false,
				success:      data.success || console.log,
				error:        data.error || console.log,
				data:         data.data || null
			};

			var xhr = getXmlHttp();

			xhr.onreadystatechange = data.statechanged || function() {
				if(xhr.readyState != 4)
					return;

				if(xhr.status == 200)
					data.success(contentTypeChange(data.type, xhr.responseText));
				else
					data.error(xhr);
			}

			xhr.open(data.method, data.url, true);

			if(data.method == 'POST')
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

			xhr.send(formatBody(data.data));
		} else {
			throw new BQError('AJAX Error. Not fund url to send request.')
		}
		return this;
	},

	BQuery.prototype.scrollTo = function(to, duration, timing) {
		var element = document.querySelector('body');
		var from = element.scrollTop;
		var start = new Date().getTime();
		var timingfn = this.utils.timingfn[timing] || function(x) {return x};

		setTimeout(function() {
			var now = new Date().getTime() - start;
			var progress = now / duration;
			var result = (to - from) * timingfn(progress) + from;

			element.scrollTop = result;
			console.log(result);

			if (progress < 1)
				setTimeout(arguments.callee, 10);
		}, 10);
	};

	BQuery.prototype.utils = {
		isMobile: {
			android: function() {
				return navigator.userAgent.match(/Android/i);
			},
			blackberry: function() {
				return navigator.userAgent.match(/BlackBerry/i);
			},
			ios: function() {
				return navigator.userAgent.match(/iPhone|iPad|iPod/i);
			},
			opera: function() {
				return navigator.userAgent.match(/Opera Mini/i);
			},
			windows: function() {
				return navigator.userAgent.match(/IEMobile/i);
			},
			any: function() {
				return (this.android() || this.blackberry() || this.ios() || this.opera() || this.windows());
			}
		},
		timingfn: {
			linear: function(value) {
				return value;
			},
			power: function(value) {
				return Math.pow(value, 2);
			},
			bouncein: function(value) {
				for(var a = 0, b = 1, result; 1; a += b, b /= 2) {
					if (value >= (7 - 4 * a) / 11)
						return -Math.pow((11 - 6 * a - 11 * value) / 4, 2) + Math.pow(b, 2);
				}
			},
			bounceout: function(value) {
				return 1 - BQuery.prototype.utils.timingfn.bouncein(1 - value);
			},
			bounceinout: function(value) {
				if (value < .5)
					return BQuery.prototype.utils.timingfn.bouncein(2 * value) / 2;
				else
					return (2 - BQuery.prototype.utils.timingfn.bouncein(2 * (1 - value))) / 2;
			},
			elasticin: function(value) {
			    return Math.pow(2, 10 * (value - 1)) * Math.cos(20 * value * Math.PI * 1 / 3);
			},
			elasticout: function(value) {
			   return 1 - BQuery.prototype.utils.timingfn.elasticin(1 - value);
			},
			elasticinout: function(value) {
				if (value < .5)
					return BQuery.prototype.utils.timingfn.elasticin(2 * value) / 2;
				else
					return (2 - BQuery.prototype.utils.timingfn.elasticin(2 * (1 - value))) / 2;
			}
		}
	};

	window.BQ = function(element) {
		return new BQuery(element);
	};

	window.BQ.__proto__ = {
		'name':     info.name,
		'version':  info.version,
		'author':   info.author,
		'ready':    BQuery.prototype.ready,
		'ajax':     BQuery.prototype.ajax,
		'scrollTo': BQuery.prototype.scrollTo,
		'utils':    BQuery.prototype.utils
	};

})(window, document);