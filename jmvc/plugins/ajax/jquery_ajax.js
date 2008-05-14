(function(){
	var factory = MVC.Ajax.factory;
	MVC.Ajax = function(url,options){
		//map options
		options.url = url;
		this.transport = {};
	
		options.complete = function(xmlhttp, status){
			if(options.onComplete){
				options.onComplete(xmlhttp);
			}
			if(options.onSuccess && status == 'success')
				options.onSuccess(xmlhttp);
			
			if(options.onFailure && status == 'error')
				options.onFailure(xmlhttp);
	
		};
	
		if(options.asynchronous != null){
			options.async = options.asynchronous;
		}
		if(options.parameters){
			options.data = options.parameters;
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
		
	};
	MVC.Ajax.factory = factory;
})();

if(!MVC._no_conflict) Ajax = MVC.Ajax;