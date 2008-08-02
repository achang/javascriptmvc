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
    _clean_callbacks : function(callbacks){
        if(!callbacks) throw "You must supply a callback!";
        if(typeof callbacks == 'function')
            return {onSuccess: callbacks, onError: callbacks};
        if(!callbacks.onSuccess && !callbacks.onComplete) throw "You must supply a positive callback!";
        if(!callbacks.onSuccess) callbacks.onSuccess = callbacks.onComplete;
        if(!callbacks.onError && callbacks.onComplete) callbacks.onError = callbacks.onComplete;
    },
    _default_options: function(cleaned_name, remaining_args, callbacks){
        var defaultOptions = {};
        this._add_default_callback(defaultOptions, 'success', cleaned_name, remaining_args, callbacks);
        this._add_default_callback(defaultOptions, 'error', cleaned_name, remaining_args, callbacks);
        return defaultOptions;
    },
    _add_default_callback : function(defaultOptions, callback_name,cleaned_name, remaining_args, callbacks ){
        var camel_name = 'on'+MVC.String.capitalize(callback_name);
        if(this[cleaned_name+'_'+callback_name]) 
            defaultOptions[camel_name] = 
                    MVC.Function.bind(function(response){ 
                        var cb_called = false;
                        var cb = function(){
                            cb_called = true;
                            callbacks[camel_name].apply(arguments);
                        }
                        remaining_args.unshift(response, cb);
                        var result = this[cleaned_name+'_'+callback_name].apply(this, remaining_args);
                        if(!cb_called) callbacks[camel_name](result);
                        
                    }, this);
    },
    add_req : function(action_name, func){
        var cleaned_name = action_name.replace(/_request$/,'');
        this[cleaned_name] = function(){
            var cleaned_args = MVC.Array.from(arguments);
            var callbacks = this._clean_callbacks(cleaned_args[cleaned_args.length - 1]);

            //setup request, first save old one
            var oldrequest = this.request;
            this.request = function(url, params, options){
                //url is optional!
                params = params || {};
                options = options || {};
                var remaining_args = MVC.Array.from(arguments);
                remaining_args.shift();
                remaining_args.shift();
                if(typeof url != 'string'){
                    options = params; params = url;
                    url = this.base_url+"/"+cleaned_name;
                }else
                    remaining_args.shift();
                
                var defaultOptions = this._default_options(cleaned_name, remaining_args, callbacks);
                options = MVC.Object.extend(defaultOptions, options);
                options.parameters = MVC.Object.extend(params, options.parameters);
                new MVC.Ajax(url, options );
            }
            //call request
            this[action_name].apply(this, cleaned_args);
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