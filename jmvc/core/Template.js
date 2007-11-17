/**
 * <p>Junction.Template is a class that manages the templates used in Junction</p>
 * @constructor
 * @class
 * <p>Contains classes and data that pertain to parsing and rendering templates for Junction</p>
 *
 * <p>Various Junction render methods make use of Junction.Template.look_for_template by passing in an array of suggestions or a single string, which
 * are paths to a particular template file.  Junction.Template looks to see if this file has been previously found.  If not, it looks up 
 * the suggestions and returns a parsed template if found or null if not.</p>
 * <pre class='example'>
 *  Junction.Template.look_for_template("/some/path/to/template.jst")</pre>
 */

Junction.Template = function(){
  this.klass_name = 'Junction.Template'
}

/**
 * <p>A hash containing previously found parsed template objects keyed by their full paths.  For example,
 * { '/application_files/my_client/my_app/views/expenses/report.jst': <#TemplateObject> }, could be stored in the hash.</p>
 * 
 */
Junction.Template._templates_dir = {}

/**
 * <p>Error code signifying the path given returned no template</p>
 */
Junction.Template.InvalidPath = -1;

Junction.Template.load_remote_template = function(path, text) {
	path = JITS.File.join(APPLICATION_ROOT, path)
    var template = new EjsCompiler(text);
    try {
		template.path = path;
		template.compile();
	} catch(e) {
		var file_name = Junction.Error.file_name(e);
		if(file_name && file_name == 'ejs.js') {
			var message = 'Error while compiling '+path+': '+e.message+'\n<pre><code>'+template.source.replace_angle_brackets()+'</code></pre>'
			throw new Junction.TemplateError(new Error(), message);
		} else {
			throw(e)
		}
	}
    Junction.Template.update_suggestions(path, template);
}

/**
 * <p>Looks up the given path in the _templates_dir hash.  If found, returns the object, null if not</p>
 *
 * @param {String} path a full path to the desired template
 *
 * @return {Object} Object Parsed Template object, if found, null if not found, -1 if found, but path returns no file
 */
Junction.Template.findTemplate = function(path) {
  if(Junction.Template._templates_dir[path])
    return Junction.Template._templates_dir[path];
  return null;
}

/**
 * Stores the given template object in the _templates_dir hash using the given path as the hash.</p>
 *
 * @param {String} path a full path to the desired template
 * @param {Object} template a parsed template instance
 */
Junction.Template.update_suggestions = function(path, template) {
  Junction.Template._templates_dir[path] = template
}

/**
 * <p>Looks for the file specified in the path parameter first in the template cache, and then tries to load it using Junction.Include.
 * If found, it returns a parsed template object, null if not found.</p>
 *
 * @param {String} path a full path to the desired template
 *
 * @return {Object} Object Parsed Template object, if found, null if not found
 */
Junction.Template.add_find_suggestion = function(path) {
    var template = Junction.Template.findTemplate(path)
    if (template)
        return template;
    else if (template == Junction.Template.InvalidPath)
        return Junction.Template.InvalidPath;
    else{ // will get here if the path hasn't been set yet
        var processed_template = include(path);
        if(processed_template)
        {
            return processed_template;
        }
        else {
            return Junction.Template.InvalidPath;
        }
    }
}
/**
 * <p>Looks for a template located at the path(s) given in the suggestions parameter.  Returns a parsed template or null if not found.</p>
 *
 * @param {Array} suggestions can be either a string or an array of path strings
 *
 * @return {Object} Object Parsed Template object, if found, null if not found
 */
// takes a string or an array as its argument
Junction.Template.look_for_template = function(suggestions) {
    if(typeof suggestions == "object") {
        for(var i=0; i<suggestions.length; i++) {
            var returned_template = Junction.Template.add_find_suggestion(suggestions[i])
            if(returned_template != Junction.Template.InvalidPath)
                return returned_template;
        }
    }
    else if (typeof suggestions == "string") {
        var returned_template = Junction.Template.add_find_suggestion(suggestions)
            if(returned_template != Junction.Template.InvalidPath)
                return returned_template;
    }
    return null;
}