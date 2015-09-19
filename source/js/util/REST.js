define(function(require, exports, module) {

	function load(verb, uri, options) {

		options = options || {};

		var responseType = options.responseType || "text";
		var overrideMimeType = options.overrideMimeType || null;

		return new Promise(function resolver(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open(verb, uri, true);
			xhr.responseType = responseType;

			if (overrideMimeType && xhr.overrideMimeType) {
				xhr.overrideMimeType(overrideMimeType);
			}

			xhr.onload = function onload() {
				if (200 === this.status || 0 === this.status) {
					resolve(this.response);
				} else {
					reject(new Error("Failed to send XHR " + uri + ": " + this.status));
				}
			};

			xhr.onerror = function onerror(error) {
				reject(new Error("Error in XHR " + uri + ": " + error));
			};

			xhr.send(options.data);
		});

	};

	module.exports = {
		get: function get(uri, options) {
			return load("GET", uri, options);
		},
		post: function post(uri, data, options) {
			options.data = data;
			return load("POST", uri, options);
		}
	};

});
