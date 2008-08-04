Comet = function(url, options) {
	var callback = function(transport){
		if (options.onSuccess) 
			options.onSuccess(transport);
		new Comet(url, options);
	}
	new Ajax(url, {
		method: options.method || "get",
		onSuccess: callback,
		parameters: options.parameters || {},
		headers: options.headers || {}
	})
}