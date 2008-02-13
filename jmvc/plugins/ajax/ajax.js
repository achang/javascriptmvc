Ajax = {};

Ajax.Request = function(url,options){
	this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   ''
    };
    Object.extend(this.options, options || { });
    this.options.method = this.options.method.toLowerCase();
	
	
	this.transport = Ajax.factory();
	
	
	if(this.options.asynchronous == false){
	   this.transport.open("GET", url, false);
	   this.setRequestHeaders();
	   try{this.transport.send(null);}
	   catch(e){return null;}
	   return;
	}else{
	   this.transport.onreadystatechange = (function(){
			if(this.transport.readyState == 4){
				if(this.transport.status == 200){
					this.options.onComplete(this.transport);
				}else
				{
					this.options.onComplete(this.transport);
				}
			}
		}).bind(this);
		
		this.transport.open(this.options.method, url);
		this.setRequestHeaders();
		this.transport.send(Object.toQueryString(this.options.parameters));
	}
};
Ajax.Request.prototype.setRequestHeaders = function() {
    var headers = {
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.options.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    // user-defined headers
    

    for (var name in headers){
		if(headers.hasOwnProperty(name)){
			this.transport.setRequestHeader(name, headers[name]);
		}
	}
      
};



Ajax.factory = function(){
	var factories = [function() { return new XMLHttpRequest(); },function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
	    for(var i = 0; i < factories.length; i++) {
	    try {
	        var request = factories[i]();
	        if (request != null)  return request;
	    }
	    catch(e) { continue;}
   }
};