MVC.AjaxModel = MVC.Model.extend(
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
                this.add_req(action_name, val)
            }
	    }
    },
    add_req : function(action_name, func){
        var cleaned_name = action_name.replace(/_request$/,'');
        this[cleaned_name] = function(args, callback){
            //setup request, first save old one
            var oldrequest = this.request;
            this.request = function(url, params, options){
                params = params || {};
                options = options || {};
                if(typeof url != 'string'){
                    options = params;
                    params = url;
                    url = this.base_url+"/"+cleaned_name
                }
                var defaultOptions = {};
                
                //if there is a complete
                if(this[cleaned_name+'_complete'] ) defaultOptions.onComplete = 
                    MVC.Function.bind(function(response){ 
                        var cb_called = false;
                        var cb = function(){
                            cb_called = true;
                            callback.apply(arguments);
                        }
                        var result = this[cleaned_name+'_complete'](response, callback);
                        if(!cb_called){
                            callback(result);
                        }
                    }, this);
                
                options = MVC.Object.extend(defaultOptions, options);
                options.parameters = MVC.Object.extend(params, options.parameters);
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