/**
 * @fileoverview
 * Junction.js file contains functionality used across the MVC architecture.
 */
 
Junction.check_dependency('Prototype', 'Framework.js');
Junction.check_dependency('Inflector', 'Framework.js');
Junction.check_dependency('EjsScanner', 'Framework.js');
Junction.check_dependency('Junction.Controller', 'Framework.js');
Junction.check_dependency('Junction.Dispatcher', 'Framework.js');
Junction.check_dependency('Junction.Template', 'Framework.js');
Junction.check_dependency('Junction.Include', 'Framework.js');
Junction.check_dependency('Junction.View', 'Framework.js');

/**
 * <b>NEVER CALL THIS CLASS' CONSRUCTOR</b>
 * @class This is the class
 * @throws Exception 'You should never create a junction framework'
 * @addon
 */
Junction.Framework = function(){
	throw new Junction.Error(new Error(), 'You should never create a junction framework');
}




/**
 * Initializes the application by performing various startup tasks.
 * <ol>
 * <li>Adds the default tags to the HTML page</li>
 * <li>overwrites the document title with the application title</li>
 * <li>creates a local datastore and session variable</li>
 * <li>adds the helper methods to each controller class</li>
 * <li>signals the blueprints to set themselves up</li>
 * <li>adds the has_many and belongs_to associations to each model class</li>
 * <li>calls the first 'get' to start the application up</li>
 * </ol>
 */
Junction.Framework.junction_startup = function() {
	try {
		Junction.junction_startup_tasks.each(function(task) { task(); })
	    if( location.pathname.startsWith('/project/console') ) { return }
		if(!$(Junction.View.RENDER_TO)) new Insertion.Top(document.body, "<div id='"+Junction.View.RENDER_TO+"'></div>");
		if(Junction.View.DOCUMENT_TITLE)
			document.title = Junction.View.DOCUMENT_TITLE;
        
		if(Junction.Routes.params()['controller']!=null && Junction.Routes.params()['action']!=null){
            return get(Junction.Routes.params());
        }else if(typeof APPLICATION_ROOT != 'undefined'){
			var response = new Ajax.Request(APPLICATION_ROOT+'public/welcome.html', {asynchronous: false, method: "get"});
			document.body.innerHTML  = response.transport.responseText;
		}
	    
	} catch(e) {
		Junction.Framework.render_error(e);
		return;
	}
}
/**
 * Renders an error to the page.
 * @param {Object} e
 */
Junction.Framework.render_error = function(e) {
	var fileName = 'Unknown File Name'
	var stack = '';
	var lineNumber = '';
	var name = 'Error';
	var path = '';
	var message = '';
	if(e.fileName) path = e.fileName;
	if(e.lineNumber) lineNumber = e.lineNumber;
	if(e.message) message = e.message;
	if(typeof e =='string') message = e
	if(e.fileName) fileName = e.fileName.split('/')[e.fileName.split('/').length-1];
	if(e.stack) stack = e.stack.replace(/</g,"&lt;").replace(/>/g,"&gt;");
	var error_text = ['<style>body { background-color: #fff; color: #333; } body, p, ol, ul, td { font-family: verdana, arial, helvetica, sans-serif;font-size: 13px;line-height: 18px;}pre {background-color: #eee;padding: 10px;font-size: 11px;}a { color: #000; }a:visited { color: #666; }a:hover { color: #fff; background-color:#000; }</style>'];
	error_text.push('<h1>',name,' in ',fileName,'</h1>');
	error_text.push('<pre>',message,'</pre>');
	error_text.push('<p><code>File Path: ',path,'</code></p>');
	error_text.push('<p><code>Line Number: ',lineNumber,'</code></p>');
	error_text.push('<h3>Execution Stack</h3>');
	error_text.push('<pre><code>',stack,'</code></pre>');
	// don't remove all javascripts if possible
	if($(Junction.View.RENDER_TO))
		$(Junction.View.RENDER_TO).innerHTML = error_text.join('');
	else
		document.body.innerHTML = error_text.join('');
	document.title = 'Exception Thrown';
	throw e;
	return;
}

/**
 * Places the rendered page string in an element inside the page.
 * @param {String} render_container_id The element ID in the page where the rendered content will be placed
 * @param {String} content The rendered string to be placed into the page
 */
Junction.Framework.display_content = function(render_container_id, content) {
    var el = $(render_container_id);
    if (el)
        el.innerHTML = content;
}

/**
 * Getter method to retrieve the session variable.
 * <p>The session variable is used to keep track of data that needs to persist between requests.</p>
 * @param {String} render_container_id The element ID in the page where the rendered content will be placed
 * @param {String} content The rendered string to be placed into the page
 */
Junction.Framework.get_session = function() {
    if (!Junction.Framework.session)
        Junction.Framework.session = {};
    return Junction.Framework.session;
}

/**
 * 
 * @class This class is an Exception that gets thrown when something goes wrong in a Junction application.
 *      <p>If an error occurs during an application, a Junction.Error instance is created and then thrown.</p>
 *      <p>Here is an example of creating and throwing a Junction.Error that will also give you an approximate 
 *          line number in Firefox: </p> 
 *      <pre class='example'>
 *          try {
 *               causeError();
 *           }
 *           catch (e) {
 *               thow(new Junction.Error(Junction.ErrorType.Request, e.lineNumber, "Framework.js"));
 *           }</pre> 
 *
 *      <p>Users can define their own error handling in one of two ways:</p>
 * <ol>
 * <li>Add a try...catch around the block of code they expect to fail</li>
 *      <pre class='example'>
 *          try {
 *              var task = Task.find(1).send();
 *          catch(e) {
 *              // swallow the exception in the case task 1 doesn't exist
 *          }</pre>
 * <li>Define their own error_handler controller action.  This action is called by default whenever an error occurs inside an action</li>
 *      <pre class='example'>
 *          error_handler : function(e) {
 *          if(e.type == Junction.ErrorType.Request) {
 *              alert('There has been an error in a request')
 *          }</pre>
 * </ol>
 *
 *  @param {Junction.ErrorType} type An integer specified by Junction.ErrorType corresponding to the type of error
 * <p>The following ErrorType's are supported currently:</p>
 * <ul>
 * <li>Junction.ErrorType.Not_authenticated: used when the server determines the user is not authenticated in the application.</li>
 * <li>Junction.ErrorType.Request: used when there is an error while the server is processing a request.</li>
 * </ul>
 *  @param {int} lineNumber The line number of the error (this is currently only supported in Firefox)
 *  @param {string} fileName The name of the file that threw this error
 *
 * @addon
 */
Junction.Error = Class.create({
	initialize: function(error, message, line_number) {
		for(var attr in error)
			this[attr] = error[attr]
		this.name = 'JunctionError';
		this.message = message;
		if(!this.lineNumber && line_number)
			this.lineNumber = line_number;
		return this;
	}
});

Junction.IncludeError = Class.create(Junction.Error)
Junction.TemplateError = Class.create(Junction.Error)

Junction.Error.file_name = function(e) {
	if(e && e.fileName) {
		var file = new JITS.File(e.fileName)
		
		return file.file_and_extension();
	}
	return null;
}

Junction.DISPATCH_FUNCTION(Junction.Framework.junction_startup);

Junction.library_loaded();

for(var i = 0; i < Junction.SETUP.included_libraries.length; i++) {
	Junction.require(JUNCTION_ROOT+'lib/'+Junction.SETUP.included_libraries[i]+'/setup.js');
}