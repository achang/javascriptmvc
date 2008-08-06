// new Comet("http://127.0.0.1/GetEvents", {onSuccess: myfunc, headers: {"Cookie": User.sessionID}})
MVC.Comet = function(url, options) {
	this.url = url;
	this.options = options || {};
	this.onSuccess = options.onSuccess;
    this.onComplete = options.onComplete;
    this.onFailure = options.onFailure;
    
    delete this.options.onSuccess;
    delete this.options.onComplete;
    delete this.options.onFailure;
    
    this.options.onComplete = MVC.Function.bind(this.callback, this);

    
    //setup function to keep calling
     new MVC.Comet.transport(url, this.options)
}
//Change this to other transports (MVC.WindowName)
MVC.Comet.transport = MVC.Ajax;
MVC.Comet.send = true;
MVC.Comet.prototype = {
	callback : function(transport) {
		if (this.onSuccess && transport.responseText != "" && this.onSuccess(transport) == false) return false;

        //we should check if there is a failure
        if(this.onComplete) if(this.onComplete(transport) == false) return false;
        
        
        var url = this.url;
        var options = this.options;
        
        if(MVC.Comet.send)
            setTimeout(function(){ new MVC.Comet.transport(url, options) },0) 
        
	}
}


//Setup onunload to kill future requests
MVC.Event.observe(window, 'unload', function(){
    MVC.Comet.send = false;
});


if(!MVC._no_conflict && typeof Comet == 'undefined'){
	Comet = MVC.Comet;
}