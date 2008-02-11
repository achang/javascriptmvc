/**
 * @fileoverview
 * Framework.js file contains functionality used across the MVC architecture.
 */
 


/**
 * <b>NEVER CALL THIS CLASS' CONSRUCTOR</b>
 * @class This is the class
 * @throws Exception 'You should never create a JMVC framework'
 * @addon
 */
JMVC.Framework = function(){
	throw new JMVC.Error(new Error(), 'You should never create a JMVC framework');
};


//window.onerror = JMVC.error_handler;

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
JMVC.Framework.JMVC_startup = function() {
	try {
		JMVC.JMVC_startup_tasks.each(function(task) { task(); });
	    if( location.pathname.startsWith('/project/console') ) { return; }
		if(!$(JMVC.RENDER_TO)) new Insertion.Top(document.body, "<div id='"+JMVC.RENDER_TO+"'></div>");

        
		if(JMVC.Routes.params()['controller']!=null && JMVC.Routes.params()['action']!=null){
            return get(JMVC.Routes.params());
        }else if(typeof APPLICATION_ROOT != 'undefined'){
			var response = new Ajax.Request(APPLICATION_ROOT+'public/welcome.html', {asynchronous: false, method: "get"});
			document.body.innerHTML  = response.transport.responseText;
		}
	    
	} catch(e) {
		JMVC.Framework.render_error(e);
		return;
	}
};
/**
 * Renders an error to the page.
 * @param {Object} e
 */
JMVC.Framework.render_error = function(e) {
	var fileName = 'Unknown File Name';
	var stack = '';
	var lineNumber = '';
	var name = 'Error';
	var path = '';
	var message = '';
	if(e.fileName) path = e.fileName;
	if(e.lineNumber) lineNumber = e.lineNumber;
	if(e.message) message = e.message;
	if(typeof e =='string') message = e;
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
	if($(JMVC.RENDER_TO))
		$(JMVC.RENDER_TO).innerHTML = error_text.join('');
	else
		document.body.innerHTML = error_text.join('');
	document.title = 'Exception Thrown';
	throw e;
	return;
};








include.set_path(JMVC.get_application_root());
JMVC.user_initialize_function();