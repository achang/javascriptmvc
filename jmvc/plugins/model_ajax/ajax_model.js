MVC.AjaxModel = MVC.Class.extend(
//class methods
{
    request : function(){
        
    },
    init: function(){
        if(!this.className) return;
        var val, act;
        this.actions = {};
        for(var action_name in this){
    		val = this[action_name];
    		if( typeof val == 'function' && action_name != 'Class' && action_name.match(/_request$/)){
                this.add_request(action_name, val)
            }
	    }
    },
    add_request : function(action_name, func){
        var cleaned_name = action_name.replace(/_request$/,'');
        this[cleaned_name] = function(args, callback){
            //setup request, first save old one
            var oldrequest = this.request;
            this.request = function(url, options){
                var params = {};
                if(this[cleaned_name+'_complete'] ) params.onComplete = 
                    MVC.Function.bind(function(response){ this[cleaned_name+'_complete'](response, callback);}, this);
                
                options = MVC.Object.extend(params, options);
                
                new MVC.Ajax(url, options );
            }
            //call request
            this[action_name].call(this, args, callback);
            this.request = oldrequest;
        }
    }
},
//prototype methods
{}
);

if(!MVC._no_conflict && typeof AjaxModel == 'undefined'){
	AjaxModel = MVC.AjaxModel;
}