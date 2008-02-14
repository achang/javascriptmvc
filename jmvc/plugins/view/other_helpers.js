/**
 * Creates a select box for selecting a record of a belongs_to association.
 * <pre class='example'>
 * &lt;%= belongs_to_select(Installation, 'computer', null, {representive_column: "ip_address"} ) %></pre>
 * 
 * produces: <select 'Installation[computer_id]'><option value='1'>127.0.0.1</option><option value='2'>73.45.678.44</option></select>
 * 
 * @param {JMVC.ActiveRecord} klass The active record class you are creating a form element for.
 * @param {String} relationship_name The relationship for the active record class.
 * @param {String/Integer} value an optional default value.
 * @param {Object} html_options Optional html attributes
 */
View.Helpers.belongs_to_select = function(klass, relationship_name, value , html_options ){
	if(typeof klass == 'string') klass = window[klass];

	html_options = html_options || {};
	html_options.representive_column = html_options.representive_column  || null;
	
	var assoc_class = window[klass.associations().belongs_to[relationship_name].model_name];
	
	
	if(! html_options.representive_column && assoc_class.column_names().include('title') == true) 
		html_options.representive_column = 'title';
	if(! html_options.representive_column && assoc_class.column_names().include('name') == true) 
		html_options.representive_column = 'name';
	
	var fkey = klass.associations().belongs_to[relationship_name].foreign_key;
	var options = assoc_class.find("all");
	var txt = '<select name="'+klass.klass_name+'['+fkey+']">';
	
	for(var i = 0; i < options.length; i++)
	{
		var option = options[i];
		txt+= '<option value="'+option.id+'"   '+(value && value[fkey]==option.id ?  'SELECTED':'')+'>';
		if(!html_options.representive_column)
			txt+= option.toString();
		else {
			if(typeof option[html_options.representive_column] == 'function')
				txt+= option[html_options.representive_column]();
			else
				txt+= option[html_options.representive_column];
		}
		txt+="</option>";
	}
	txt+= "</select>";
	return txt;
};

/**
 * Returns a closure that calls a get action when called.
 * <p>This is useful for assigning onclick and other event handlers using javascript rather than html.</p>
 * <pre class='example'>
 * $('my_botton').onclick = View.Helpers.closure_for({action: 'say_hi'})</pre>
 * @param {Object} options A url hash.
 * @return {function} request function.
 */
View.Helpers.closure_for = function(options) {
    return function() {
        get(options);
    };
};



/**
 * Returns true if parameters in options match the parameters of the current page.
 * @param {Object} options
 
View.Helpers.is_current_page = function(options) {
	if(typeof options == 'string'){
		return (window.location.href == options || window.location.pathname == options ? true : false);
	}
	
	options = $H(options) || $H(); //prototype
	
	var options_extended = Object.extend(Object.clone(JMVC.Routes.params()), options);
	
	return (this.url_for(options_extended) == this.url_for(JMVC.Routes.params()) ? true : false)
}*/



/**
 * Creates a link tag of the given name using a URL 
 * created by the set of options unless the condition is true.  If the condition is true,
 * only the name is returned. 
 * To specialize the default behavior, you can pass a function that accepts 
 * the name or the full argument list for link_to_unless (see the example).
 * 
 * <p>False condition example:</p>
 * <pre class='example'>
 * view.link_to_unless(false, 'Reply', {action: 'reply'} ) </pre>
 * <p>Produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *    document.write(  view.link_to_unless(false, 'Reply', {action: 'reply'} ).escapeHTML()  );
 * </script>
 * Looks like => 
 * <script language="javascript" type="text/javascript">
 *    document.write(  view.link_to_unless(false, 'Reply', {action: 'reply'} )  );
 * </script></pre>
 * <br/><br/>
 * <p>True condition example:</p>
 * <pre class='example'>
 * view.link_to_unless(true, 'Reply', {action: 'reply'} ) </pre>
 * <p>Produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *    document.write(  view.link_to_unless(true, 'Reply', {action: 'reply'} ).escapeHTML()  );
 * </script></pre>
 * <br/><br/>
 * <p>Block function example:</p>
 * <pre class='example'>
 * view.link_to_unless(true, 'Reply', {action: 'reply'}, null, null, function(){view.link_to('Log in', {action: 'Log in'}) } ) </pre>
 * <p>Produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *    document.write(  
 *    view.link_to_unless(true, 'Reply', 
 *    	{action: 'reply'}, null, null, 
 *      function(){ return view.link_to('Log in', {action: 'login'} ) } ).escapeHTML()  );
 * </script>
 * Looks like =>
 * <script language="javascript" type="text/javascript">
 *    document.write(  
 *    view.link_to_unless(true, 'Reply', 
 *    	{action: 'reply'}, null, null, 
 *      function(){ return view.link_to('Log in', {action: 'login'} ) } )  );
 * </script></pre>
 * 
 * @param {Boolean} condition  If true, returns the name or calls the block function, if false, creates a link.
 * @param {String} name  The display text of the link
 * @param {Object} options  options that are used to create a url
 * @param {Object} html_options  Html attribute hash
 * @param {Boolean} post  True if clicking link is a post request, false if otherwise.  Defaults to false.
 * @param {Object} block optional function that is called if the condition evaluates to true.  The block is called with 
 * 					name, options, html_options, and block.
 */
View.Helpers.link_to_unless = function(condition, name, options, html_options, post, block) {
	options = options || {};
	html_options = html_options || {};
	if(condition) {
		if(block && typeof block == 'function') {
			return block(name, options, html_options, post, block);
		} else {
			return name;
		}
	} else
		return this.link_to(name, options, html_options, post);
};



/**
 * Creates a link tag of the given name using a URL created by the 
 * set of options unless the current request uri is the same as the 
 * links, in which case only the name is returned (or the given 
 * block is yielded, if one exists). 
 * Refer to the documentation for link_to_unless for block usage.
 * @param {Object} name
 * @param {Object} options
 * @param {Object} html_options
 * @param {Object} post
 * @param {Object} block
 * @see #link_to_unless
 
View.Helpers.link_to_unless_current = function(name, options, html_options, post, block) {
	options = options || {};
	html_options = html_options || {};
	return this.link_to_unless(this.is_current_page(options), name, options, html_options, post, block);
};

*/


/**
 * Creates an external link tag of the given name using a URL created by the set of options.  If passed a string
 * for options, that is set as the href attribute.
 * 
 * <p>Example:</p>
 * <pre class='example'>
 * view.link_to_external('Scaffold Main Page', 'http://scaffold.jupiterit.com') </pre>
 * <p>Produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *    document.write(  view.link_to_external('Scaffold Main Page', 'http://scaffold.jupiterit.com').escapeHTML()  );
 * </script>
 * Looks like =>
 * <script language="javascript" type="text/javascript">
 *    document.write(  view.link_to_external('Scaffold Main Page', 'http://scaffold.jupiterit.com')  );
 * </script></pre>
 * @param {String} name link's text.
 * @param {String} path url
 * @param {Object} html_options Hash of html attributes.
 *
 * @return {String} hyperlink text.
 *
 */
View.Helpers.link_to_external = function(text, path, html_options) {
    if(!html_options) var html_options = {};
    html_options.href=path;
    return this.start_tag_for('a', html_options)+text+ this.tag_end('a');
};





/**
 * Packages a form's data and sends it as a post request.
 * <p>Post_form uses package_form to package the form object.
 * Form elements should not use controller or action as names or post will not be able to direct appropriately.</p>
 * <p>If the action called sets the send_form_to_server flag to true, post_form will add a target, action, method, and enctype to the form
 * to prepare it to be sent to the server.  It also takes any ids in the file_id_hash and places them in the form.
 * It will also return true, which sends the form.</p>
 * @param {Node} form_element Form whose data will be packaged into the request.
 * @param {Object} options URL request options.  The forms data will be packaged in this object.
 * @param {String} submit_button_name Optional parameter used by package_form.
 * @see #package_form
 */
View.Helpers.post_form = function(form_element, options, submit_button_name) {
    View.Helpers.send_form_to_server = false;
    // hash of file fields with their ids as the value
    View.Helpers.insert_id_into_form = true;
    post( this.package_form( form_element, options, submit_button_name ) );
    var insert_id_into_form = View.Helpers.insert_id_into_form;
    delete View.Helpers.insert_id_into_form;
    if(View.Helpers.send_form_to_server == true) { // set up form for server
        new Insertion.Top(document.body, "<iframe id='upload_frame' name='upload_frame' style='display:none' onload='JMVC.Dispatcher.resume_execution();'></iframe>");
        form_element.setAttribute('target', 'upload_frame');
        form_element.setAttribute('action', '/'+JMVC.app_info.client.name+'/'+JMVC.app_info.project.name+'/file_upload');
        // look for all file ids to place into the form
        if(insert_id_into_form)
            new Insertion.Top(form_element, '<input type="hidden" '+
                'name="'+insert_id_into_form.model+'[id]" value="'+insert_id_into_form.id+'" />');
        return true;
    }
    return false;
};



/**
 * Adds a value to an object with a given path.  This function is used by package_form
 * to add nested attributes/objects to an object.
 * <p>Example:
 * <pre class='example'>
 * var tree = {}
 * view.set_map_tree_value(tree, 'nested[path]', 'myValue')
 * tree.nested.path     ==> returns 'myValue'</pre>
 * @private
 * @param {Object} mapTree Object where you will add attributes and the value.
 * @param {String} path attributes seperated by [] that determine where you object will be inserted.
 * @param {} value value of final attribute.
 */
View.Helpers.set_map_tree_value = function(mapTree, path, value) { // Example path is 'order[customer][name]'.
    if (path != null) {
        var keys = path.replace(/\]/g, '').split('[');
        for (var k = 0; k < keys.length; k++) {
            var key = keys[k];
            if (k < keys.length - 1) {
                if (mapTree[key] == null || typeof mapTree[key] != 'object')
                    mapTree[key] = {};
                mapTree = mapTree[key];                                
            } else {
                mapTree[key] = value;
            }
        }
    }
};



/**
 * Updates options with controller and action attributes.
 * <p>This is primarly used by url_for to provide a default controller for actions.</p>
 * @param {Object} A url hash.
 * @private
 */
View.Helpers.update_with_controller_and_action = function(options) {
      if(!options)
        options= {};
      if(!options.controller)
        options.controller = JMVC.Routes.params()['controller'];
      if(!options.action)
        options.action = JMVC.Routes.params()['action'];
};

/**
 * Updates options with controller and action attributes.
 * <p>This is primarly used by url_for to provide a default controller for actions.</p>
 * @param {Object} A url hash.
 */
View.Helpers.update_with_client_and_project = function(options) {
      if(!options)
        options= {};
      if(!options.action)
        options.action = 'index';
      if(!options.controller)
        options.project = JMVC.Routes.params()['controller'];
};
/**
 * Returns javascript text that when run will call a controller action with parameters defined in params.
 * <p>This is primarly used for adding to onclick or other functions when creating templates.</p>
 * @param {Object} A url hash.
 * @param {Boolean} post true if a post request, false if otherwise.  Default is a get request.
 * @return {String} request function.
 */
View.Helpers.url_for = function(params, post) {
    //this.update_with_controller_and_action(params);
    //if(post == true)
    //   return 'post(' + $H(params).toJSON() + ');'; //prototype
    //else
    //    return 'get(' + $H(params).toJSON() + ');'; //prototype
};
/**
 * uses the type of column to deterimine the type of field it should present.  Useful in bluepritns.
 * @param {Object} model_name
 * @param {Object} column_name
 * @param {Object} options
 */
View.Helpers.input = function(model_name, column_name, options) {
	options = options || {};
	options.value = options.value || '';
	var type = window[model_name].columns_hash()[column_name].sql_type;
	if(this[type+'_tag'])
		return this[type+'_tag'](model_name+'['+column_name+']', options.value, options);
	return this.text_field_tag(model_name+'['+column_name+']', options.value, options);	
};


View.Helpers.HandlerObject = function(value) {
	this.value = value;
};

View.Helpers.HandlerObject.prototype = {
	toJSON : function() {
		return this.value;
	}
};
/**
 * Creates a external start form tag.
 * <p>Example:</p>
 * <pre class='example'>
 *  form_tag_external( '/action' ) 
 * </pre>
 * Produces:
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *   document.write( view.form_tag_external( '/action' ).escapeHTML() ) ;
 * </script></pre>
 * @param {String} action The post action
 * @param {Object} html_options Options used to create html attributes.
 *
 * @return {String} A begining form tag.
 *
 */
View.Helpers.form_tag_external = function(action, html_options) {
    html_options     = html_options                     || {};
    html_options.action = action;
    return this.start_tag_for('form', html_options);
};