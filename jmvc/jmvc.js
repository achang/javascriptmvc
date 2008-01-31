/**
 * 
 * This is a static class and should never be instantiated.
 * @constructor
 * @class
 * <p>JMVC is the namespace of all other functions in JMVC</p>
 */

if(!document.body) document.write("<body></body>")
	
JMVC = function() {}


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
}
/**
 * <p>Loads the correct version of JMVC.</p>
 * <p>Saves the user defined app_init_func to be executed later (once JMVC files are included).</p>
 */
JMVC.Initializer = function(user_initialize_function) {
  	
	APPLICATION_ROOT = new jFile( include.get_path() ).directory()
	JMVC.user_initialize_function = user_initialize_function;

    if(!(JMVC.ENV.ENVIRONMENT == 'development' || JMVC.ENV.ENVIRONMENT == 'production'))
		throw new JMVC.Error(new Error(), 'unknown JMVC.ENV.ENVIRONMENT');
    JMVC.ENV.BASE_PATH = JMVC_ROOT;
	include(JMVC.ENV.BASE_PATH+'/core/Framework');  
	// Framework should have just what it takes for the complex folder strucutre.
	// this is so if there is no initializer function called, only framework isn't provided.  However, controller, views, etc are still available
	// this allows people to easily add parts
	
}

JMVC.check_dependency = function(dependency_class_name, dependent_file_name) {
    var eval_text = 'if(typeof '+dependency_class_name+' == "undefined") ';
    eval_text += 'throw("'+dependency_class_name+' dependency violated for '+dependent_file_name+'")';
    eval(eval_text);
}

JMVC.SETUP = {}
JMVC.SETUP.included_libraries = [];

JMVC.include_library = function(library_name) {
	JMVC.SETUP.included_libraries.push(library_name)
}
JMVC.include_libraries = function(library_names){
	if(arguments.length > 1){
		for(var i=0; i < arguments.length; i++)
			JMVC.include_library(arguments[i])
		return;
	}
	if(typeof library_names == 'string') library_names = [library_names]
	
	for(var i=0; i < library_names.length; i++)
			JMVC.include_library(library_names[i])
	
}
var include_library = JMVC.include_library;

JMVC.ENV = {ENVIRONMENT: 'development'};
//JMVC.ENV.ENVIRONMENT == 'development'
JMVC.OPTIONS = {};
JMVC.Test = {};

(function(){
	var remote = false;
	if(typeof APPLICATION_ROOT == 'undefined') 
		APPLICATION_ROOT = location.href.substring(0, location.href.lastIndexOf('/') )+ '/'
	
	if(APPLICATION_ROOT.match(/^http(s*):\/\//)) {
		var domain = APPLICATION_ROOT.match(/^(http(s*):\/\/[\w|\.|:|\d]*)/)[0]
		JMVC.application_domain = function(){
			return domain;
		}
		var pages_domain = location.href.match(/^(http(s*):\/\/[\w|\.|:|\d]*)/) 
		if(!pages_domain || domain != pages_domain[0]) remote = true; //need to check if you are local
	}
	JMVC.remote = function(){
		return remote;
	}
})()

JMVC.SETUP.waiting_for = [];
JMVC.wait_for = function(name) {
	JMVC.SETUP.waiting_for.push(name);
}

JMVC.libraries_loaded_counter = -1;
// libraries call this function when they are done loading
// when all libraries have loaded, this function calls the 
// JMVC.user_initialize_function()
JMVC.loaded = function() {
	JMVC.libraries_loaded_counter=JMVC.libraries_loaded_counter+1;
	var total_to_load = JMVC.SETUP.waiting_for.length + JMVC.SETUP.included_libraries.length;
	if(JMVC.libraries_loaded_counter >= total_to_load && !JMVC.initialized) {
		JMVC.initialized = true;
		JMVC.user_initialize_function();
		if(JMVC.remote == true)
			JMVC.cache_templates = false;
	}
}
if(typeof Prototype == 'undefined') include("dependencies/query_event")


include( 
		  "dependencies/helpers",
		  "dependencies/Inflector",
		  "dependencies/file",
		  "dependencies/ejs",
		  "core/controller",
		  "core/Include",
		  "core/View")