$MVC.Ajax = {};

$MVC.Ajax.Request = function(url,options){
	//map options
	options.url = url;
	this.transport = {};
	if(options.onComplete){
		options.complete = function(xmlhttp, status){
			options.onComplete(xmlhttp);
		};
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
	this.options = options;
	this.url = url;
	if(options.async){
		return jQuery.ajax(options);
	}else{
		return {transport: jQuery.ajax(options) };
	}
	
}