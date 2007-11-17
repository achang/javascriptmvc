/**
 * <p>JMVC.Include is a class that loads various file types from the server onto the client machine</p>
 * 
 * @constructor
 * @class
 * <p>Javascript Templates (.jst), css, and javascript files all can be loaded using this class</p>
 *
 * <p>Users can load their own javascript files, stylesheets, or template files using a single entry point: include.
 * JMVC.Include.include is made accessible as window.include.  Users can use it as follows:</p>
 * <pre class='example'>
 *  include('javascripts/special_functions.js');
 *  include('stylesheets/my_style.css');
 *  include('expenses/report.jst')</pre>
 *
 * <p>The above examples show relative paths, and include will intelligently prepend the remainder of the file path using
 * the current application's client and project name.  Absolute paths also are handled correctly.</p>
 */
JMVC.Include = function(){
    this.klass_name = 'JMVC.Include'

};

/**
 * <p>Users can include their own stylesheets, javascripts, and template files using this method.  It is also made available through window.include.</p>
 * <p>include will return a parsed template (or null) if the extension of the requested file is .jst.</p>
 * @param {String} path The location (relative or absolute) of the requested file.  If the path is relative, the path is assumed to begin at the 
 *      {application_name}/javascripts directory for javascripts, the {application_name}/stylesheets directory for stylesheets, and the 
 *      {application_name}/views directory for .jst's
 * @param {Boolean} cache Whether the requested file should be cached or forced to be reloaded each time (only for .jst's).  This 
 *      is meant to assist during application development, but should be turned off for production applications.
 *
 * @return {Object} Object Parsed Template is returned if requested file has a .jst extension (or null if not found).  Otherwise,
 *      nothing is returned.
 */
JMVC.Include.include = function(path, options) {
    if(!options) options = {};
    var cache = options.cache;
    var synchronous = options.synchronous;
    if(cache === undefined)
        var cache = JMVC.cache_templates || false;
    if(synchronous === undefined)
        var synchronous = false;
    var file = new JITS.File(path);
    if(file.is_absolute() == false && file.extension() == "js") // is a local javascript
        JMVC.Include.include_JS(JITS.File.join(APPLICATION_ROOT, 
            path), synchronous);
    else if(file.is_absolute() == true && file.extension() == "js")  // is a non-local javascript
        JMVC.Include.include_JS(path+(cache == false ? "?"+Math.random(): ""), synchronous);
    else if(file.is_absolute() == false && file.extension() == "jst") // is a local template
        return JMVC.Include.include_template(JITS.File.join(APPLICATION_ROOT, 
            path), cache);
    else if(file.is_absolute() == true && file.extension() == "jst") // is a non-local template
        return JMVC.Include.include_template(path, cache);
    else if(file.is_absolute() == false && file.extension() == "css") // is a local stylesheet
        JMVC.Include.include_CSS(JITS.File.join(APPLICATION_ROOT, path));
    else if(file.is_absolute() == true && file.extension() == "css") // is a non-local stylesheet
        JMVC.Include.include_CSS(path, cache);
}

/**
 * array of file paths that have already been included (to prevent duplicates)
 * @private
 */ 
JMVC.Include._included_path_cache = {};

/**
 * <p>Determines if the given path has been loaded already.  If not, adds the path to the lookup cache, and returns false.</p>
 *
 * @param {String} path The absolute path to look up.
 *
 * @return {Boolean} Boolean returns true if this file was already included, false if not
 */
// returns true if the given URL has been included already
// if not included already, adds the URL to the lookup cache
JMVC.Include.already_included = function(path) {
    if(JMVC.Include._included_path_cache[path] == true)
        return true;
    JMVC.Include._included_path_cache[path] = true;
    return false;
}

/**
 * <p>Checks if the javascript file was already loaded.  If not, it is loaded into the page.</p>
 *
 * @param {String} path The path of the requested javascript file
 */
JMVC.Include.include_JS = function(path, synchronous) {
    if(this.already_included(path) == false) {
        if(!synchronous)
            document.write('<script type="text/javascript" src="'+path+'"></script>');
        else {
            var response = new Ajax.Request(path, {asynchronous: false, method: "get"});
			if(response.transport.status == 404)
				return null;
	        window.eval(response.transport.responseText);
        }
    }
}

/**
 * <p>Checks if the stylesheet file was already loaded.  If not, it is loaded into the page.</p>
 *
 * @param {String} path The path of the requested stylesheet
 */
JMVC.Include.include_CSS = function(path) {
    if(this.already_included(path) == false) {
        document.write('<link type="text/css" rel="stylesheet" href="'+path+'"></link>');
    }
}

var include = JMVC.Include.include;

/**
 * <p>Attemps to load the file at the given path using an Ajax request.  If the file is found, it is parsed and returned.
 * Otherwise, null is returned indicating no file was found at this location.</p>
 *
 * @param {String} path The path of the requested file
 * @param {Boolean} cache Whether this template should be cached locally or reloaded during each request
 *
 * @return {Object} Object Parsed template Object, if found.  null if nothing exists at this path.
 */
JMVC.Include.include_template = function(path, cache) {
	// if this is a remote application, reroute the templates to grab processed templates
	if(JMVC.remote == true) {
		path = path.replace(/\/views\//, '/processed_views/');
		path = path.substring(0,path.length-1);
		include(path);
		return;
	}
    var DOMpath = path;
    if(cache == false)
        path += "?sid=" + Math.random();
    var response = new Ajax.Request(path, {asynchronous: false, method: "get"});
    var responseText = response.transport.responseText;
    if (response.transport.status == 404) { // this means the template was not found
        if(cache) 
            JMVC.Template.update_suggestions(path, JMVC.Template.InvalidPath);
        return null;
    }
    var template = new EjsCompiler(responseText);
    try {
		template.path = path;
		template.compile();
		
	} catch(e) {
		var file_name = JMVC.Error.file_name(e);
		if(file_name && file_name == 'ejs.js') {
			var message = 'Error while compiling '+path+': '+e.message+'\n<pre><code>'+template.source.replace_angle_brackets()+'</code></pre>'
			throw new JMVC.TemplateError(new Error(), message);
		} else {
			throw(e)
		}
	}
    if(cache) 
        JMVC.Template.update_suggestions(path, template);
    return template;
}