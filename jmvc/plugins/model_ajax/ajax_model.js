MVC.AjaxModel = MVC.Model.extend(
//class methods
{
    _send_and_get : function(params, callback, url){
        var url =  this._interpolate(url, params);
        new MVC.Ajax(url, {parameters: params, onComplete: callback, method: 'get'});
    },
    _interpolate: function(string, params) {
        var result = string;
        for(var val in params) {
          if(params.hasOwnProperty(val)) {
    		  var re = new RegExp(":" + val, "g");
    	      if(result.match(re))
    	      {
    	        result = result.replace(re, params[val]);
    	        delete params[val];
    	      }
    	  }
        }
        return result;
    },
    prefix: function(){ return this.className },
    _prefix : function(){
        return typeof this.prefix == 'function' ? this.prefix() : this.prefix;
    },
    find_one_url : ':id',
    _find_one_url: function(){
        return '/'+[this._prefix(),this.find_one_url].join('/');
    },
    find_one : function(params, callback){
        //needs to call after_find_one
        newcallback = MVC.Function.bind(function(response){
            var res = this.after_find_one(response, params);
            if(callback) callback(res);
		}, this);
        this._send_and_get(params, newcallback, this._find_one_url());
    }
},
//prototype methods
{}
);

if(!MVC._no_conflict && typeof AjaxModel == 'undefined'){
	AjaxModel = MVC.AjaxModel;
}