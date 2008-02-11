/**
 * 
 * This is a static class and should never be instantiated.
 * @constructor
 * @class
 * <p>JMVC is the namespace of all other functions in JMVC</p>
 * sets JMVC root
 * creates the initializer function
 * creates include.plugins
 * sets the application route
 * includes the standard set now
 */

JMVC = function() {};
JMVC.OPTIONS = {};
JMVC.Test = {};


(function() {
	var root = include.get_absolute_path();
	JMVC.root = function(){
		return root;
	};
})();


/**
 * <p>Loads the correct version of JMVC.</p>
 * <p>Saves the user defined app_init_func to be executed later (once JMVC files are included).</p>
 */
JMVC.Initializer = function(user_initialize_function) {
	// if APPLICATION_ROOT is located at the current directory, there wont be any '/'s in the path
	if(include.get_path().lastIndexOf('/') == -1) {
		APPLICATION_ROOT = '';
	} else {
		var config_folder = include.get_path();
		// the APPLICATION_ROOT is the current path minus the config folder
		APPLICATION_ROOT = include.get_path().substring(0, config_folder.lastIndexOf('/'));
	}
	JMVC.user_initialize_function = user_initialize_function;


	include(JMVC.root()+'/framework');  

};


include.plugin = function(plugin_name) {
	var current_path = include.get_path();
	include.set_path(JMVC.root());
	include('plugins/'+ plugin_name+'/setup');
	include.set_path(current_path);
};

include.plugins = function(){
	for(var i=0; i < arguments.length; i++)
		include.plugin(arguments[i]);
};

(function(){
	var remote = false;
	if(typeof APPLICATION_ROOT == 'undefined') 
		APPLICATION_ROOT = location.href.substring(0, location.href.lastIndexOf('/') )+ '/';
	
	if(APPLICATION_ROOT.match(/^http(s*):\/\//)) {
		var domain = APPLICATION_ROOT.match(/^(http(s*):\/\/[\w|\.|:|\d]*)/)[0];
		JMVC.application_domain = function(){
			return domain;
		};
		var pages_domain = location.href.match(/^(http(s*):\/\/[\w|\.|:|\d]*)/) ;
		if(!pages_domain || domain != pages_domain[0]) remote = true; //need to check if you are local
	}
})();


include.plugins("includer","controller_view");
		  
//JMVC.handle_error = function(error){
//	alert(error.toString());
//};