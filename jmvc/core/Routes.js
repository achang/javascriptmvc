/**
 * 
 * This is a static class and should never be instantiated.
 * @constructor
 * @class
 * <p>Routes define a set of rules that map matching URLs to specific controllers and actions.
 * They are configured in the Junction.Routes.draw method, which is called within Junction.Initializer
 * in the config/environment.rb file.</p>
 * 
 * <p>The hash mark (#) is required to be placed after the APPLICATION_ROOT html page in the url, as
 * this is where controller/action parameters are added with dhtmlHistory.  Any part of a route starting with a colon
 * is a param passed to the controller actions invoked.  You can also hardcode param values, passing them as a second
 * parameter to map.connect.  The mapping rules are attempted in the given order.</p>
 * 
 * <pre class='example'>
 * Junction.Routes.draw(function(map) {
 *		map.connect('/:app_name/#:controller/:action')
 *		map.connect('/:app_name/index.html/#:controller/:action')
 *	})</pre>
 */

Junction.Routes = function(){};

Junction.Routes.clear_route_cache = function() {
	Junction.Routes._params = null;
};

/**
 * Used to get the routes from the current url
 */
Junction.Routes.params = function()
{
    if(Junction.Routes._params)
        return Junction.Routes._params;
    Junction.Routes._params = $H()
    
	var path = new Junction.Path(decodeURIComponent( location.href ))
	
	Junction.Routes._params.merge(Junction.Routes.match_route(path));
	Junction.Routes._params.merge(Junction.Routes.get_data(path));
	Junction.Routes.url_params = Object.clone(Junction.Routes._params);
	return Junction.Routes._params;
}
/**
 * List of routes
 */
Junction.Routes.routes_array = [];

/**
 * Basically this function sets up the connect function, which addes routes to a nice place, and then calls
 * the users functions which should use it.
 * @param {Object} map_function
 */
Junction.Routes.draw = function(map_function) {
	var map = {}
	// TODO make this correctly match patterns to assignements like Rails does
	map.connect = function(route_pattern, assignments_hash) {
		Junction.Routes.routes_array.push(new Junction.Route(route_pattern, assignments_hash) );
	}
	map_function(map);
}

// accepts a url_component (like /database/test/client)
// matches based on the rules setup with Junction.Routes.draw
// returns an object with the parameters based on the matched rule
Junction.Routes.match_route = function(path) {
	for(var i=0; i<Junction.Routes.routes_array.length; i++) {
		var route = Junction.Routes.routes_array[i]
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
Junction.Routes.get_data = function(path) {
	var search = path.params();
	if(search) {
	    var match = search.strip().match(/([^?#]*)(#.*)?$/);
	    if (!match) return { };
	
	    return match[1].split('&').inject({ }, function(hash, pair) {
	      if ((pair = pair.split('='))[0]) {
	        var key = decodeURIComponent(pair.shift());
			var key_components = /(.*)\[(.*)\]/.exec(key);
	        var value = pair.length > 1 ? pair.join('=') : pair[0];
	        if (value != undefined) value = decodeURIComponent(value);
			if(key_components) {
				if(!hash[key_components[1]])
					hash[key_components[1]] = {};
				hash[key_components[1]][key_components[2]] = value;
			} else {
		        if (key in hash) {
		          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
		          hash[key].push(value);
		        }
		        else hash[key] = value;
			}
	      }
	      return hash;
	    });
	}
	return {};
}
/**
 * Goes through routes in order.  If it finds one it matches, it returns the url after the #
 * @param {Object} options
 */
Junction.Routes.url_for = function(options){

	for(var i=0; i<Junction.Routes.routes_array.length; i++) {
		var route = Junction.Routes.routes_array[i]
		if(route.has_params(options) )
			return route.draw(options)
	}
	
	return '&'+Hash.toQueryString(options);
}


Junction.Route = function(route_pattern, assignments_hash) {
	this.route_pattern = route_pattern
	this.assignments_hash = assignments_hash
}
Junction.Path = function(path) {
	this.path = path
}
Junction.Path.prototype = {
	domain : function() {
		var lhs = this.path.split('#')[0];
		return '/'+lhs.split('/').slice(3).join('/')
	},
	folder : function() {
		var parts = this.path.split('#')
		if(parts.length <= 1)
			return null;
		parts.shift()
		var rhs = parts.join('#') // computer/list&
		return rhs.split("&")[0]
	},
	params : function() {
		var parts = this.path.split('#')
		if(parts.length <= 1)
			return null;
		parts.shift()
		var rhs = parts.join('#') // computer/list&
		var rhs_parts =  rhs.split("&")
		if(rhs_parts.length <= 1)
			return null;
		rhs_parts.shift();
		return rhs_parts.join("&")
	}
}
Junction.Route.prototype = {
	domain : function() {
		return this.route_pattern.split('#')[0];
	},
	folder : function() {
		return this.route_pattern.split('#')[1];
	},
	needed_params : function() {
		var components = this.route_pattern.split('#');
		var domain = this.domain();
		var parts = []
		//parts.add( Junction.Routes.parts_for(domain))
		if(components.length > 1)
			parts.add( Junction.Routes.parts_for(components[1]))
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
		var leftovers = Hash.toQueryString(leftover_params)
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
		return Junction.Route.does_path_part_match_route(path.domain(), this.domain() )
	},
	matches_folder : function(path){
		return Junction.Route.does_path_part_match_route(path.folder(), this.folder() )
	},
	populate_params_with_path : function(path, params ) {
		params = params || {}
		if(this.route_pattern == '*') // default route, match everything
			return params;
		Junction.Route.fill_params(path.domain(), this.domain(), params)
		Junction.Route.fill_params(path.folder(), this.folder(), params)
		return params
	}
	
}
Junction.Route.does_path_part_match_route = function(path, route) {
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
Junction.Route.fill_params = function(path, route, params) {
		if(! route && ! path) return;
		if( (route && ! path) || (!route && path)) throw new Junction.Error(new Error(), 'You have a mismatch in your routing!');
		
		var route_domain_parts = route.split("/");
		var path_domain_parts = path.split("/");
		if(route_domain_parts.length != path_domain_parts.length) throw new Junction.Error(new Error(), 'You have a mismatch in your routing!');
		for(var i=0; i<route_domain_parts.length; i++){
			if( route_domain_parts[i].startsWith(':') ){
				params[ route_domain_parts[i].substring(1) ] = path_domain_parts[i]
			}
		}
}

Junction.Routes.parts_for = function(partial) {
	var parts = [];
	var folders = partial.split('/')
	for(var i = 0; i < folders.length; i++){
		if(folders[i].startsWith(':'))
			parts.push(  folders[i].substring(1) );
	}
	return parts;
}