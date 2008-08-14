// new Comet("http://127.0.0.1/GetEvents", {onSuccess: myfunc, headers: {"Cookie": User.sessionID}})
MVC.Comet = function(url, options) {
	this.url = url;
	this.options = options || {};
	this.onSuccess = options.onSuccess;
    this.onComplete = options.onComplete;
    this.onFailure = options.onFailure;
    
    delete this.options.onSuccess;
    delete this.options.onComplete;
    //delete this.options.onFailure;
    
    this.options.onComplete = MVC.Function.bind(this.callback, this); // going to call this every time.
    
    //check in options for stop function, if there, use it, otherwise replace it
    
    
    if(!this.options.is_killed){  //if we don't have an is killed, it doesn't exist yet
        var killed = false;
        
        this.kill = function(){killed = true;}
        this.options.is_killed = function(){return killed};
    }
    this.transport = this.options.transport || MVC.Comet.transport;
    
    //setup function to keep calling
    new this.transport(url, this.options)
}
//Change this to other transports (MVC.WindowName)
MVC.Comet.transport = MVC.Ajax;

MVC.Comet.prototype = {
	callback : function(transport) {
        if(this.options.is_killed()) return; //ignore new data if killed
        
        if (this.onSuccess && transport.responseText != "" && this.onSuccess(transport) == false) return false;

        //we should check if there is a failure
        if(this.onComplete) if(this.onComplete(transport) == false) return false; //if onComplete returns false, teminates cycle.
        
        
        var url = this.url;
        var options = this.options;
        //options.onComplete = this.onComplete;
        //options.onSuccess = this.onSuccess;
            setTimeout(function(){ new MVC.Comet.transport(url, options) },0);
        
	}
}


//Setup onunload to kill future requests
MVC.Event.observe(window, 'unload', function(){
    MVC.Comet.send = false;
});


if(!MVC._no_conflict && typeof Comet == 'undefined'){
	Comet = MVC.Comet;
}