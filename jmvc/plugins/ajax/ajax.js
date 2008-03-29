$MVC.Ajax = {};

$MVC.Ajax.Request = function(url,options){
	this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   ''
    };
	this.url = url;
    $MVC.Object.extend(this.options, options || { });
    
	//var params = Object.clone(this.options.parameters);
	
	this.options.method = this.options.method.toLowerCase();
	
	if (!$MVC.Array.include(['get', 'post'],this.options.method)) {
      // simulate other verbs over post
      if(this.options.parameters == ''){
	  	this.options.parameters = {_method : this.options.method};
	  }else
	  	this.options.parameters['_method'] = this.options.method;
      this.options.method = 'post';
    }
	

	if (this.options.method == 'get' && this.options.parameters != '' )
	   this.url += ($MVC.String.include(this.url,'?') ? '&' : '?') + $MVC.Object.toQueryString(this.options.parameters);
	//else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
	//   params += '&_=';
    
	
	this.transport = $MVC.Ajax.factory();
	
	
	if(this.options.asynchronous == false){
	   this.transport.open(this.options.method, this.url, this.options.asynchronous);
	   this.setRequestHeaders();
	   try{this.transport.send(null);}
	   catch(e){return null;}
	   return;
	}else{
	   this.transport.onreadystatechange = $MVC.Function.bind(function(){
			if(this.transport.readyState == 4){
				if(this.transport.status == 200){
					this.options.onComplete(this.transport);
				}else
				{
					this.options.onComplete(this.transport);
				}
			}
		},this);
		
		this.transport.open(this.options.method, this.url, true);
		this.setRequestHeaders();
		this.transport.send($MVC.Object.toQueryString(this.options.parameters));
	}
};
$MVC.Ajax.Request.prototype.setRequestHeaders = function() {
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



$MVC.Ajax.factory = function(){
	var i = window.ActiveXObject ? 0 : 1;
	var factories = [function() { return new XMLHttpRequest(); },function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
	    for(i; i < factories.length; i++) {
	    try {
	        var request = factories[i]();
	        if (request != null)  return request;
	    }
	    catch(e) { continue;}
   }
};


if(!$MVC._no_conflict){
	Ajax = $MVC.Ajax;
}