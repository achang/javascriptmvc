Ajax = {};

Ajax.Request = function(url,options){
	//map options
	options.url = url;
	if(options.onComplete){
		options.complete = options.onComplete;
	}
	if(options.asynchronous != null){
		options.async = options.asynchronous;
	}
	if(options.parameters){
		options.data = options.parameters
	}
	if(options.method){
		options.type = options.method
	}
	return jQuery.ajax(options);
}