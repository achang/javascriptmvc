// new Comet("http://127.0.0.1/GetEvents", {onSuccess: myfunc, headers: {"Cookie": User.sessionID}})
MVC.Comet = function(url, options) {
	this.url = url;
	this.options = options || {};
	this.options.wait_time = this.options.wait_time || 0
    this.onSuccess = options.onSuccess;
    this.onComplete = options.onComplete;
    this.onFailure = options.onFailure;
    
    delete this.options.onSuccess;
    delete this.options.onComplete;
    //delete this.options.onFailure;
    
    this.options.onComplete = MVC.Function.bind(this.callback, this); // going to call this every time.
    
    //check in options for stop function, if there, use it, otherwise replace it
    
    
    //if(!this.options.is_killed){  //if we don't have an is killed, it doesn't exist yet
    
    var killed = false;
    var polling = true;  // we start at the end of this function
    this.kill = function(){killed = true;}
    
    this.poll_now = function(){
        // if we aren't waiting, kill the timer that says wait and go right now
        //console.log('no wait called')
        if(this.is_polling()) return;
        
        //console.log('not waiting so kill!')
        clearTimeout(this.timeout);
        //var options = this.options;
        //options.waiting_to_poll();
        
       // var transport = this.transport;
        //this.timeout = setTimeout(function(){ 
        this.options.polling();
        new this.transport(this.url, this.options);
        
        //},0);
    }
    
    this.options.is_killed = function(){return killed};
    this.options.waiting_to_poll = function(){  polling = false; };
    this.options.polling = function(){  polling = true; };
    this.is_polling = function(){ return polling; };
    //}
    this.transport = this.options.transport || MVC.Comet.transport;
    
    //setup function to keep calling
    new this.transport(url, this.options)
}
//Change this to other transports (MVC.WindowName)
MVC.Comet.transport = MVC.Ajax;

MVC.Comet.prototype = {
	callback : function(transport) {
        this.options.waiting_to_poll(); //start waiting to resume polling
        
        if(this.options.is_killed()) return; //ignore new data if killed
        
        if (this.onSuccess && transport.responseText != "" && this.onSuccess(transport) == false) return false;

        //we should check if there is a failure
        if(this.onComplete) if(this.onComplete(transport) == false) return false; //if onComplete returns false, teminates cycle.
        
        
        var url = this.url;
        var options = this.options;
        //options.onComplete = this.onComplete;
        //options.onSuccess = this.onSuccess;
        var transport=  this.transport;
        
        var wait_time = typeof options.wait_time == 'function' ? options.wait_time() : options.wait_time
        
        this.timeout = setTimeout(function(){ 
            options.polling();
            new transport(url, options);
        
        },wait_time);
        
	}
}


//Setup onunload to kill future requests
MVC.Event.observe(window, 'unload', function(){
    MVC.Comet.send = false;
});


if(!MVC._no_conflict && typeof Comet == 'undefined'){
	Comet = MVC.Comet;
}