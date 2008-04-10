/**
 * 
 * This is a static class and should never be instantiated.
 * @constructor
 * @class
 * <p>Routes define a set of rules that map matching URLs to specific controllers and actions.
 * They are configured in the JMVC.Routes.draw method, which is called within JMVC.Initializer
 * in the config/environment.rb file.</p>
 * 
 * <p>The hash mark (#) is required to be placed after the APPLICATION_ROOT html page in the url, as
 * this is where controller/action parameters are added with dhtmlHistory.  Any part of a route starting with a colon
 * is a param passed to the controller actions invoked.  You can also hardcode param values, passing them as a second
 * parameter to map.connect.  The mapping rules are attempted in the given order.</p>
 * 
 * <pre class='example'>
 * JMVC.Routes.draw(function(map) {
 *		map.connect('/:app_name/#:controller/:action')
 *		map.connect('/:app_name/index.html/#:controller/:action')
 *	})</pre>
 */

//requires MVC.View!

JMVC.Routes = function(){};

(function(){
	var params = null;
	JMVC.Routes.clear_route_cache = function() {
		params = null;
	};
	
	/**
	 * Used to get the routes from the current url
	 */
	
	JMVC.Routes.params = function(url){
	    if(params && url == null)
	        return params;
	    
		var path = new JMVC.Path( url ? url : decodeURIComponent( location.href ) )
		
		params = Object.extend( 
			Object.extend( {}, $H(JMVC.Routes.get_data(path))), 
				JMVC.Routes.match_route(path) 
		).toObject();
		return params;
	}
})()






/**
 * List of routes
 */
JMVC.Routes.routes_array = [];

/**
 * Basically this function sets up the connect function, which addes routes to a nice place, and then calls
 * the users functions which should use it.
 * @param {Object} map_function
 */
JMVC.Routes.draw = function(map_function) {
	var map = {}
	// TODO make this correctly match patterns to assignements like Rails does
	map.connect = function(route_pattern, assignments_hash) {
		JMVC.Routes.routes_array.push(new JMVC.Route(route_pattern, assignments_hash) );
	}
	map_function(map);
}

// accepts a url_component (like /database/test/client)
// matches based on the rules setup with JMVC.Routes.draw
// returns an object with the parameters based on the matched rule
JMVC.Routes.match_route = function(path) {
	for(var i=0; i<JMVC.Routes.routes_array.length; i++) {
		var route = JMVC.Routes.routes_array[i]
		if(route.matches(path) )
		{
			var params = route.populate_params_with_path(path)
			return $H(params).merge(route.assignments_hash);
		}
	}
	return {};
}
/**
 * Function converts params into objects
 * @param {Object} path
 */
JMVC.Routes.get_data = function(path) {
	var search = path.params();
	if(! search || ! search.match(/([^?#]*)(#.*)?$/) ) return {}
	var data = {}
	var parts = search.split('&')
	for(var i=0; i < parts.length; i++){
		var pair = parts[i].split('=')
		if(pair.length != 2) continue;
		var key = pair[0], value = pair[1];
		var key_components = key.rsplit(/\[[^\]]*\]/)
		
		if( key_components.length > 1 ) {
			var last = key_components.length - 1;
			var nested_key = key_components[0].toString();
			if(! data[nested_key] ) data[nested_key] = {};
			var nested_hash = data[nested_key]
			
			for(var k = 1; k < last; k++){
				nested_key = key_components[k].substring(1, key_components[k].length - 1)
				if( ! nested_hash[nested_key] ) nested_hash[nested_key] ={}
				nested_hash = nested_hash[nested_key]
			}
			nested_hash[ key_components[last].substring(1, key_components[last].length - 1) ] = value
		} else {
	        if (key in data) {
	        	if (typeof data[key] == 'string' ) data[key] = [data[key]];
	         	data[key].push(value);
	        }
	        else data[key] = value;
		}
		
	}
	return data;
}
/**
 * Goes through routes in order.  If it finds one it matches, it returns the url after the #
 * @param {Object} options
 */
JMVC.Routes.url_for = function(options){

	for(var i=0; i<JMVC.Routes.routes_array.length; i++) {
		var route = JMVC.Routes.routes_array[i]
		if(route.has_params(options) )
			return route.draw(options)
	}
	
	return '&'+MVC.Object.to_query_string(options);
}



JMVC.Path = function(path) {
	this.path = path
}
JMVC.Path.prototype = {
	domain : function() {
		var lhs = this.path.split('#')[0];
		return '/'+lhs.split('/').slice(3).join('/')
	},
	folder : function() {
		var first_pound = this.path.indexOf('#')
		if( first_pound == -1) return null;
		var after_pound =  this.path.substring( first_pound+1 )
		
		var first_amp = after_pound.indexOf("&")
		if(first_amp == -1 ) return after_pound.indexOf("=") != -1 ? null : after_pound
		
		return after_pound.substring(0, first_amp)
	},
	//types of urls
	//  /someproject#action/controller&doo_doo=butter
	//  /someproject#doo_doo=butter
	params : function() {
		var first_pound = this.path.indexOf('#')
		if( first_pound == -1) return null;
		var after_pound =  this.path.substring( first_pound+1 )
		
		//now either return everything after the first & or everything
		var first_amp = after_pound.indexOf("&")
		if(first_amp == -1 ) return after_pound.indexOf("=") != -1 ? after_pound : null
		
		return ( after_pound.substring(0,first_amp).indexOf("=") == -1 ? after_pound.substring(first_amp+1) : after_pound )
		 
	}
}
//assignments_hash - the default values for parts in the route

JMVC.Route = function(route_pattern, assignments_hash) {
	this.route_pattern = route_pattern
	this.assignments_hash = assignments_hash
}

JMVC.Route.prototype = {
	domain : function() {
		return this.route_pattern.split('#')[0];
	},
	folder : function() {
		return this.route_pattern.split('#')[1];
	},
	folders : function(){
		var first_pound = this.route_pattern.indexOf('#')
		if(first_pound == -1) return [];
		var after_pound =  this.route_pattern.substring( first_pound+1 )
		return after_pound.split('/');
	},
	needed_params : function() {
		var parts = [];
		var folders = this.folders()
		for(var i = 0; i < folders.length; i++){
			if(folders[i].startsWith(':'))
				parts.push(  folders[i].substring(1) );
		}
		return parts;
	},
	has_params : function(params){
		var needed_params = this.needed_params()
		for(var i = 0; i < needed_params.length; i ++)
		{
			if(! params[needed_params[i]] ) return false;
		}
		return true;
	},
	draw : function(params){
		//remove anything in the domain
		if(!this.folder())	return ''
		var leftover_params = Object.clone(params)  //remove from this list anything you find
		
		var domains = this.domain().split('/')
		for(var i = 0; i < domains.length; i++){
			if(domains[i].startsWith(':')){
				delete leftover_params[ domains[i].substring(1) ] //remove
			}
		}
		
		var folders = this.folder().split('/')
		for(var i = 0; i < folders.length; i++){
			if(folders[i].startsWith(':')){
				delete leftover_params[ folders[i].substring(1) ] //remove
				folders[i] = params[folders[i].substring(1)]
			}
		}
		var leftovers = MVC.Object.to_query_string(leftover_params)
		if(leftovers != '')
			leftovers= '&'+ leftovers
			
		return folders.join('/')+leftovers
	},
	matches: function(path){
		if(this.route_pattern == '*') // default route, match everything
			return true;
		return this.matches_domain(path) && this.matches_folder(path)
	},
	matches_domain : function(path){
		return JMVC.Route.does_path_part_match_route(path.domain(), this.domain() )
	},
	matches_folder : function(path){
		return JMVC.Route.does_path_part_match_route(path.folder(), this.folder() )
	},
	//adds values to params with the path
	populate_params_with_path : function(path, params ) {
		params = params || {}
		if(this.route_pattern == '*') // default route, match everything
			return params;
		JMVC.Route.fill_params(path.domain(), this.domain(), params)
		JMVC.Route.fill_params(path.folder(), this.folder(), params)
		return params
	}
	
}
JMVC.Route.does_path_part_match_route = function(path, route) {
		if(! route && ! path) return true;
		if( (route && ! path) || (!route && path)) return false;
		
		var route_domain_parts = route.split("/");
		var path_domain_parts = path.split("/");
		if(route_domain_parts.length != path_domain_parts.length) return false;
		for(var i=0; i<route_domain_parts.length; i++){
			if( route_domain_parts[i].startsWith(':') ) continue;
			if(route_domain_parts[i] != path_domain_parts[i]) return false;
		}
		return true;
}
JMVC.Route.fill_params = function(path, route, params) {
		if(! route && ! path) return;
		if( (route && ! path) || (!route && path)) throw new JMVC.Error(new Error(), 'You have a mismatch in your routing!');
		
		var route_domain_parts = route.split("/");
		var path_domain_parts = path.split("/");
		if(route_domain_parts.length != path_domain_parts.length) throw new JMVC.Error(new Error(), 'You have a mismatch in your routing!');
		for(var i=0; i<route_domain_parts.length; i++){
			if( route_domain_parts[i].startsWith(':') ){
				params[ route_domain_parts[i].substring(1) ] = path_domain_parts[i]
			}
		}
}