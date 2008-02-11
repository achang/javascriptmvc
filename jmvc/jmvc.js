/**
 * 
 * This is a static class and should never be instantiated.
 * @constructor
 * @class
 * <p>JMVC is the namespace of all other functions in JMVC</p>
 */

if(!document.body) document.write("<body></body>"); //this should be somewhere after loading
	
JMVC = function() {};


// calls itself to keep the global scope clean
JMVC.get_root = function() {
	window.JMVC_ROOT = include.get_absolute_path();
}();




/**
 * JMVC.DISPATCH_FUNCTION holds a callback function that accepts another callback function.
 * <p>In a default JMVC application, this is the Event.observe on window load as shown below, which starts execution when 
 * window load occurs by calling the startup function passed.  Other applications might have another startup event dispatcher (like 
 * google.setOnLoadCallback.</p>
 * 
 * <p>JMVC.DISPATCH_FUNCTION is called in Framework and passed the JMVC.Framework.JMVC_startup function.</p>
 * @param {function} startup  A callback function for the DISPATCH_FUNCTION to call when it is ready
 */
JMVC.DISPATCH_FUNCTION = function(startup) {
	Event.observe(window, 'load', startup); //added  remove prototype
};
/**
 * <p>Loads the correct version of JMVC.</p>
 * <p>Saves the user defined app_init_func to be executed later (once JMVC files are included).</p>
 */
JMVC.Initializer = function(user_initialize_function) {
  	var  config_folder = include.get_path();
	APPLICATION_ROOT = include.get_path().substring(0, config_folder.lastIndexOf('/'));
	JMVC.user_initialize_function = user_initialize_function;

    if(!(JMVC.ENV.ENVIRONMENT == 'development' || JMVC.ENV.ENVIRONMENT == 'production'))
		throw new JMVC.Error(new Error(), 'unknown JMVC.ENV.ENVIRONMENT');
    JMVC.ENV.BASE_PATH = JMVC_ROOT;
	include(JMVC.ENV.BASE_PATH+'/core/Framework');  

};

JMVC.check_dependency = function(dependency_class_name, dependent_file_name) {
    var eval_text = 'if(typeof '+dependency_class_name+' == "undefined") ';
    eval_text += 'throw("'+dependency_class_name+' dependency violated for '+dependent_file_name+'")';
    eval(eval_text);
};

include.plugin = function(plugin_name) {
	var current_path = include.get_path();
	include.set_path(JMVC_ROOT);
	include('plugins/'+ plugin_name+'/setup');
	include.set_path(current_path);
};

include.plugins = function(){
	for(var i=0; i < arguments.length; i++)
		include.plugin(arguments[i]);
	return;
};

JMVC.SETUP = {};
JMVC.SETUP.included_libraries = [];

JMVC.ENV = {ENVIRONMENT: 'development'}; //this shouldn't even be here
JMVC.OPTIONS = {};
JMVC.Test = {};

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
	JMVC.remote = function(){
		return remote;
	};
})();


include.plugins("includer","controller_view");
		  
//JMVC.handle_error = function(error){
//	alert(error.toString());
//};