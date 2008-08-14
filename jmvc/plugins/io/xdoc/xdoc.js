MVC.XDoc = function(url, options){
    this.url = url;
    this.options = options || {};
    this.options.method = this.options.method || 'post';
    this.options.parameters = this.options.parameters || {};
    
    //save requests if not ready
    if(MVC.XDoc._can_request)
        this.send(); //if ready
    else
        MVC.XDoc.waiting_requests.push(this);
}

MVC.XDoc.requesting = null;
MVC.XDoc.waiting_requests = [];

MVC.XDoc.prototype = {
    send: function(){
         if(this.options.session){
            var session = typeof this.options.session == 'function' ? this.options.session() : this.options.session;
            this.url += (MVC.String.include(this.url,';') ? '&' : ';') + MVC.Object.to_query_string(session);
         }

         var params  = typeof this.options.parameters == 'function' ? this.options.parameters() : this.options.parameters; //will eval everytime
        

         this.url += (MVC.String.include(this.url,'?') ? '&' : '?') + MVC.Object.to_query_string(params);
          
                
         var frame = MVC.XDoc._frame;
         var receiver = frame.contentWindow;
         
         
         MVC.XDoc.requesting = this;
         receiver.postMessage(this.url);
         
    },
    handle: function(event){
        eval("var data = "+event.data);
        data.responseText = event.data;
        this.options.onComplete(data);
    }
}

MVC.XDoc.next = function(){
    var next = MVC.XDoc.waiting_requests.shift();
    if(next) next.send();
}

MVC.XDoc.observing = false;


MVC.XDoc.styleFrame = function(frame){
	frame.style.width="100%";
	frame.style.height="100%";
	frame.style.border="0px";
    frame.style.display = 'none';
}
//waiters

MVC.XDoc._can_request = false;
MVC.XDoc.frame_loaded = function(){
    MVC.XDoc._can_request = true;
    
};


//Assumes that JavaScriptMVC is running with a body 
(function(){
    var frame = document.createElement(MVC.Browser.IE ? 
        '<iframe name="' + frameName + '" onload="MVC.XDoc.frame_loaded()">' :
        'iframe'
    )
    
    
	MVC.XDoc.styleFrame(frame);
    document.body.appendChild(frame);
    frame.onload = MVC.Function.bind(MVC.XDoc.frame_loaded, MVC.XDoc);
    frame.contentWindow.location = "http://scaffuld.com:8080/test.html";
    MVC.XDoc._frame = frame;
})();


//recieve messages on this document
MVC.Event.observe(document, 'message', function(event){
    MVC.XDoc.requesting.handle(event);
    MVC.XDoc.next();
});
