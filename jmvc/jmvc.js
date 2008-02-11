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

//sets default app root to whatever page we are currently loading
//can be changed by set application root
(function() {
	var jmvc_root = include.get_absolute_path(), 
		application_root = location.href.substring(0, location.href.lastIndexOf('/') )+ '/';
	JMVC.root = function(){
		return jmvc_root;
	};
	JMVC.set_application_root = function(path){
		application_root = path;
	};
	JMVC.get_application_root = function(){
		return application_root;
	};
})();


/**
 * <p>Loads the correct version of JMVC.</p>
 * <p>Saves the user defined app_init_func to be executed later (once JMVC files are included).</p>
 */
JMVC.Initializer = function(user_initialize_function) {

	if(include.get_path().lastIndexOf('/') == -1) {
		JMVC.set_application_root('');
	} else {
		var config_folder = include.get_path();
		JMVC.set_application_root(include.get_path().substring(0, config_folder.lastIndexOf('/')));
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

include.plugins("includer","controller_view");
		  
//JMVC.handle_error = function(error){
//	alert(error.toString());
//};