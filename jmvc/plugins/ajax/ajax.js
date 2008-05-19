// Modified version of Ajax.Request from prototype
//  Prototype JavaScript framework, version 1.6.0.1
//  (c) 2005-2007 Sam Stephenson
(function(){
	var factory = MVC.Ajax.factory;
	MVC.Ajax = function(url,options){
		this.options = {
	      method:       'post',
	      asynchronous: true,
	      contentType:  'application/x-www-form-urlencoded',
	      encoding:     'UTF-8',
	      parameters:   ''
	    };
		this.url = url;
	    MVC.Object.extend(this.options, options || { });
	    
		//var params = Object.clone(this.options.parameters);
		
		this.options.method = this.options.method.toLowerCase();
		
		if (!MVC.Array.include(['get', 'post'],this.options.method)) {
	      // simulate other verbs over post
	      if(this.options.parameters == ''){
		  	this.options.parameters = {_method : this.options.method};
		  }else
		  	this.options.parameters['_method'] = this.options.method;
	      this.options.method = 'post';
	    }
		
	
		if (this.options.method == 'get' && this.options.parameters != '' )
		   this.url += (MVC.String.include(this.url,'?') ? '&' : '?') + MVC.Object.to_query_string(this.options.parameters);
		//else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
		//   params += '&_=';
	    
		
		this.transport = MVC.Ajax.factory();
		
		
		if(this.options.asynchronous == false){
		   this.transport.open(this.options.method, this.url, this.options.asynchronous);
		   this.set_request_headers();
		   try{this.transport.send(this.options.parameters ? MVC.Object.to_query_string(this.options.parameters) : null);}
		   catch(e){return null;}
		   return;
		}else{
		   this.transport.onreadystatechange = MVC.Function.bind(function(){
				var state = MVC.Ajax.Events[this.transport.readyState];
				
				if(state == 'Complete'){
					if(this.success() && this.options.onSuccess) this.options.onSuccess(this.transport);
					else if(this.options.onFailure) this.options.onFailure(this.transport);
				}
				if(this.options['on'+state]){
					this.options['on'+state](this.transport);
				}
			},this);
			
			this.transport.open(this.options.method, this.url, true);
			this.set_request_headers();
			this.transport.send(MVC.Object.to_query_string(this.options.parameters));
		}
	};
	MVC.Ajax.factory = factory;
})();


MVC.Ajax.Events = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

MVC.Ajax.prototype = {
  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },
  set_request_headers: function() {
    var headers = {'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'};

    if (this.options.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    for (var name in headers){
		if(headers.hasOwnProperty(name)){
			this.transport.setRequestHeader(name, headers[name]);
		}
	}
}
};

if(!MVC._no_conflict) Ajax = MVC.Ajax;
