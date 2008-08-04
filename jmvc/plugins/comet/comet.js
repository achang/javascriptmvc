// new Comet("http://127.0.0.1/GetEvents", {onSuccess: myfunc, headers: {"Cookie": User.sessionID}})
Comet = function(url, options) {
	this.url = url;
	this.options = options || {};
	new Ajax(url, {
		method: options.method || "get",
		onSuccess: this.callback,
		parameters: options.parameters || {},
		headers: options.headers || {}
	})
}

Comet.prototype = {
	callback : function(transport) {
		try {
			if (this.options.onSuccess && transport.responseText != "")
				var response = this.options.onSuccess(transport);
		} catch(e){
			throw(e);
		} finally {
			if(response != false) 
				new Comet(this.url, this.options);
		}
	}
}