MVC.RemoteModel = MVC.Model.extend(
{
    init: function(){
        if(!this.className) return;
        if(!this.domain) throw('a domain must be provided for remote model');
        this.controller_name = this.className;
        this.plural_controller_name = MVC.String.pluralize(this.controller_name);
    },
    find_all: function(params, callback){
        params.callback = MVC.String.classize(this.className)+'.listCallback';
		//make callback function create new and call the callback with them
		if(!callback) callback = (function(){});
        
		this.listCallback = function(callback_params){
            var newObjects = this.create_many_as_existing( callback_params);
			callback(newObjects);
		};
		params['_method'] = 'GET';
		include(this.domain+'/'+this.plural_controller_name+'.json?'+MVC.Object.to_query_string(params)+'&'+Math.random());
    },
    create : function(params, callback) {
		this.add_standard_params(params, 'create');
		var klass = this, className = this.className, url = this.domain+'/'+this.plural_controller_name+'.json?';
		var tll = this.top_level_length(params, url);
		var result = this.seperate(params[this.controller_name], tll,this.controller_name );
        var postpone_params = result.postpone, send_params = result.send;
        
		if(!callback) callback = (function(){});
        
		params['_method'] = 'POST';

		if(result.send_in_parts){
			klass.createCallback = this.parts_create_callback(params, callback);
			params[this.controller_name] = send_params;
			params['_mutlirequest'] = 'true';
			include(url+MVC.Object.to_query_string(params));
		}else{
			klass.createCallback = this.single_create_callback(callback);
			params['_mutlirequest'] = null;
			include(url+MVC.Object.to_query_string(params));
		}
	},
    parts_create_callback : function(params, callback){
        return function(callback_params){
			if(! callback_params.id) throw 'Your server must callback with the id of the object.  It is used for the next request';
            params[this.controller_name] = postpone_params;
			params.id = callback_params.id;
			this.create(params, callback);
		};
    },
    single_create_callback : function(callback){
        return function(callback_params){
				if(callback_params[this.className]){
					var inst = new this(callback_params[this.className]);
					inst.add_errors(callback_params.errors);
					callback(inst);
				}else{
					callback(new this(callback_params));
				}
		};
    },
	add_standard_params : function(params, callback_name){
		if(!params.referer) params.referer = window.location.href;
		params.callback = MVC.String.classize(this.className)+'.'+callback_name+'Callback';
	},
    callback_name : 'callback',
    domain: null,
    top_level_length: function(params, url){
    	var p = MVC.Object.extend({}, params);
        delete p[this.className];
        return url.length + MVC.Object.to_query_string(p).length;

    },
    seperate: function(object, top_level_length, name){
    	var remainder = 2000 - 9 - top_level_length; 
    	var send = {};
    	var postpone = {};
    	var send_in_parts = false;
    	for(var attr in object){
    		if(! object.hasOwnProperty(attr) ) continue;
    		var value = object[attr], value_length;
    		var attr_length = encodeURIComponent( name+'['+attr+']' ).length;
    		
    		if(typeof value == 'string'){
    			value_length = encodeURIComponent( value ).length;
    		}else{
    			value_length = value.toString().length;
    		}
    		
    		if(remainder - attr_length <= 30) {
    			postpone[attr] = value;
    			send_in_parts = true;
    			continue;
    		};
    		remainder = remainder - attr_length - 2; //2 is for = and &
    		if(remainder >  value_length){
    			send[attr] = value;
    			remainder -= value_length;
    		}else if(typeof value == 'string'){
    			var guess = remainder;
    			while( encodeURIComponent( value.substr(0,guess) ).length > remainder ){
    				guess = parseInt(guess * 0.75) - 1;
    			}
    			send[attr] = value.substr(0,guess);
    			postpone[attr] = value.substr(guess);
    			send_in_parts = true;
    			remainder = 0;
    		}else{
    			postpone[attr] = value;
    		}
    	}
    	return {send: send, postpone: postpone, send_in_parts: send_in_parts};
    },
    random: parseInt( Math.random()*1000000 )
},
//prototype functions
{});

