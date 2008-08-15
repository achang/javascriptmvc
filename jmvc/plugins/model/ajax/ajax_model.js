MVC.AjaxModel = MVC.Model.extend(
//class methods
{
    transport: MVC.Ajax,
    
    request : function(){
        
    },
    _matching : /(\w+?)_?(get|post|delete|update|)_success$/, 
    init: function(){
        if(!this.className) return;
        var val, act, matches;
        this.actions = {};
        for(var action_name in this){
    		val = this[action_name];
    		if( typeof val == 'function' && action_name != 'Class' && (matches = action_name.match(this._matching))){
                this.add_req(matches, val)
            }
	    }
    },
    _default_options: function(cleaned_name, method, remaining_args, callbacks){
        var defaultOptions = {};
        this._add_default_callback(defaultOptions, 'success', method, cleaned_name, remaining_args, callbacks);
        this._add_default_callback(defaultOptions, 'error', method, cleaned_name, remaining_args, callbacks);
        return defaultOptions;
    },
    _add_default_callback : function(defaultOptions, callback_name,method, cleaned_name, remaining_args, callbacks ){
        var camel_name = 'on'+MVC.String.capitalize(callback_name);
        var fname1 = cleaned_name+'_'+method+'_'+callback_name;
        var fname2 = cleaned_name+'_'+callback_name;
        var fname = this[fname1] ? fname1 : (this[fname2] ? fname2 : null )
        
        if(fname) 
            defaultOptions[camel_name] = 
                    MVC.Function.bind(function(response){ 
                        var cb_called = false;
                        var cb = function(){
                            cb_called = true;
                            callbacks[camel_name].apply(arguments);
                        }
                        remaining_args.unshift(response, cb);
                        var result = this[fname].apply(this, remaining_args);
                        if(!cb_called) callbacks[camel_name](result);
                    }, this);
    },
    _make_public : function(cleaned_name, method){
        /**
         * Arguments
         *  - a list of arguments
         *  - ending with a single function callback or an object of callbacks
         */
        var defaultURL = this.base_url+"/"+cleaned_name;
        if(this[cleaned_name+"_"+method+"_url"]) 
            defaultURL=typeof this[cleaned_name+"_"+method+"_url"] == 'function' ?
                        this[cleaned_name+"_"+method+"_url"]() : this[cleaned_name+"_"+method+"_url"];
        
        return function(params){
            //get arguments 
            var cleaned_args = MVC.Array.from(arguments);
            var callbacks = this._clean_callbacks(cleaned_args[cleaned_args.length - 1]);
            params = cleaned_args.length > 1 ? params : {}; //make sure it isn't just a callback
            //save old request (if compounded)
            var oldrequest = this.request;
            
            /**
             * This is called by default if request isn't called
             * @param {Object} url
             * @param {Object} params
             * @param {Object} options
             */
            
            var defaultOptions = {method: method}
            var request_called = false;
            this.request = function(url, request_params, options){
                //url is optional!
                request_called = true;
                request_params = request_params || params;
                options = options || defaultOptions;
                var remaining_args = MVC.Array.from(arguments).splice(2, arguments.length - 2);
                if(typeof url != 'string'){
                    options = params; params = url;
                    url = this.base_url+"/"+cleaned_name;
                }else
                    remaining_args.shift();
                
                var defaultOptions = this._default_options(cleaned_name, method, remaining_args, callbacks);
                options = MVC.Object.extend(defaultOptions, options);
                options.parameters = MVC.Object.extend(request_params, options.parameters);
                new this.transport(url, options );
            }
            var result;
            //check if (name)_(method)_request exists
            if(this[cleaned_name+"_"+method])
                result = this[cleaned_name+"_"+method].apply(this, arguments);
            else if( this[cleaned_name+"_request"] )
                result = this[cleaned_name+"_request"].apply(this, arguments);
                
            //if it doesn't call request with the appropriate functions
            if(!request_called) this.request(defaultURL, params, defaultOptions );
            return result;
        }
    },
    add_req : function(matches, func){
       var action_name = matches[0];
       var cleaned_name = matches[1];
       var method = matches[2] || 'post'

       this[cleaned_name] = this._make_public(cleaned_name, method)
    },
    get_id : function(transport){
        var loc = transport.responseText;
	  	try{loc = transport.getResponseHeader("location");}catch(e){};
        if (loc) {
          //todo check this with prototype
		  var mtcs = loc.match(/\/[^\/]*?(\w+)?$/);
		  if(mtcs) return parseInt(mtcs[1]);
        }
        return null;
    }
    
},
//prototype methods
{}
);

if(!MVC._no_conflict && typeof AjaxModel == 'undefined'){
	AjaxModel = MVC.AjaxModel;
}