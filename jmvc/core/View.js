/**
 * @fileoverview
 * The View.js file contains an Javascript implementation of the 
 * active view design pattern and supporting functionality.
 * <p class='credits'>JavaScript MVC based off <a href='http://trimpath.com/'>TrimJunction framework</a>.
 * @author Jupiter Information Technology Solutions - Brian Moschel, Justin Meyer.<br/>
 * @version 0.1
 */

/**
 * <script language="javascript" src="/junction_setup.js" type="text/javascript"></script>
 * 
 * This is a static class and should never be instantiated.
 * @constructor
 * 
 * @class
 * <script language="javascript" type="text/javascript">
 *    get = function() {
 *          alert('get() called, this would normally direct you to a local action.')
 *    }
 * </script>
 * EjsView provides a set of methods for easily creating links and html elements.  This class
 * is added to window as view.  So instead of calling:
 * <pre class='example'>
 * EjsView.link_to( {action: <span>'list'</span>} )</pre>
 * you can call:
 * <pre class='example'>
 * view.link_to({action: <span>'list'</span>})</pre>
 *
 * In your templates, these methods are added to the data object you are rendering with.  So you can call them like:
 * <pre class='example'>
 * &lt;p&gt;I am going to show a link&lt;/p&gt;
 * &lt;%=  link_to('Click Me', {action: 'list'} ) %></pre>
 * @see JMVC.Controller
 * @see JMVC.ActiveRecord
 */

EjsView = function() {
    this.klass = 'EjsView'
}
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
EjsView.belongs_to_select = function(klass, relationship_name, value , html_options ){
	if(typeof klass == 'string') klass = window[klass]

	html_options = html_options || {};
	html_options.representive_column = html_options.representive_column  || null;
	
	var assoc_class = window[klass.associations().belongs_to[relationship_name].model_name]
	
	
	if(! html_options.representive_column && assoc_class.column_names().include('title') == true) 
		html_options.representive_column = 'title'
	if(! html_options.representive_column && assoc_class.column_names().include('name') == true) 
		html_options.representive_column = 'name'
	
	var fkey = klass.associations().belongs_to[relationship_name].foreign_key
	var options = assoc_class.find("all");
	var txt = '<select name="'+klass.klass_name+'['+fkey+']">'
	
	for(var i = 0; i < options.length; i++)
	{
		var option = options[i];
		txt+= '<option value="'+option.id+'"   '+(value && value[fkey]==option.id ?  'SELECTED':'')+'>'
		if(!html_options.representive_column)
			txt+= option.toString()
		else {
			if(typeof option[html_options.representive_column] == 'function')
				txt+= option[html_options.representive_column]()
			else
				txt+= option[html_options.representive_column]
		}
		txt+="</option>"
	}
	txt+= "</select>"
	return txt;
}

/**
 * Returns a closure that calls a get action when called.
 * <p>This is useful for assigning onclick and other event handlers using javascript rather than html.</p>
 * <pre class='example'>
 * $('my_botton').onclick = EjsView.closure_for({action: 'say_hi'})</pre>
 * @param {Object} options A url hash.
 * @return {function} request function.
 */
EjsView.closure_for = function(options) {
    return function() {
        get(options);
    };
}

/**
 * creates a date select tag.
 * <p>Example:</p>
 * <pre class='example'>
 *  view.date_tag('Installation[date]')</pre>
 * <p>produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *   document.write( view.date_tag('Installation[date]') ) ;
 * </script></pre>
 * @param {Object} name  The name of the form element.
 * @param {Object} value  optional default date value.
 * @param {Object} html_options  optional html attributes.
 */
EjsView.date_tag = function(name, value , html_options) {
    if(! (value instanceof Date))
		value = new Date()
	
	var years = [], months = [], days =[];
	var year = value.getFullYear();
	var month = value.getMonth();
	var day = value.getDate();
	for(var y = year - 15; y < year+15 ; y++)
	{
		years.push({value: y, text: y})
	}
	for(var m = 0; m < 12; m++)
	{
		months.push({value: (m), text: Date.month_names[m]})
	}
	for(var d = 0; d < 31; d++)
	{
		days.push({value: (d+1), text: (d+1)})
	}
	var year_select = this.select_tag(name+'[year]', year, years, {id: name+'[year]'} )
	var month_select = this.select_tag(name+'[month]', month, months, {id: name+'[month]'})
	var day_select = this.select_tag(name+'[day]', day, days, {id: name+'[day]'})
	
    return year_select+month_select+day_select;
}

/**
 * Creates a file field that sets up the correct naming structure for JMVC file types.
 * <p>Example:</p>
 * <pre class='example'>
 *  view.file_tag('Task[document]')</pre>
 * <p>produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *   document.write( view.file_tag('Task[document]') ) ;
 * </script></pre>
 * @param {String} name the file type field name
 * @param {String} value Default value
 * @param {Object} html_options Options used to create html attributes.
 *
 * @return {String} Text for an file element that will upload correctly into a JMVC application
 *
 */
EjsView.file_tag = function(name, value, html_options) {
    return this.input_field_tag(name+'[file]', value , 'file', html_options)
}

/**
 * Outputs a starting form tag that points to a action configured with url_for_options.  The method for the form defaults
 * to POST.
 * <p>Example:</p>
 * <pre class='example'>
 *  form_tag( {controller: 'expenses', action: 'create' } ) 
 * </pre>
 * Produces:
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *   document.write( view.form_tag( {controller: 'expenses', action: 'create' }).escapeHTML() ) ;
 * </script></pre>
 * 
 * @param {Object} url_for_options Object used to direct to an action.
 * @param {Object} html_options Options used to create html attributes.
 * @param {Boolean} post False if you want the form to submit as a get request, true if you want the form to submit as post.  Defaults to true.
 * @return {String} A begining form tag.
 */
EjsView.form_tag = function(url_for_options, html_options) {
    html_options     = html_options                     || {};
	if(html_options.multipart == true) {
        html_options.method = 'post';
        html_options.enctype = 'multipart/form-data';
    }
		
	if(typeof url_for_options == 'string'){
		html_options.action = url_for_options
	    return this.start_tag_for('form', html_options)
	}
	
	url_for_options     = url_for_options                     || {};
    this.update_with_controller_and_action(url_for_options);
    
    html_options.onsubmit     = html_options.onsubmit                     || '' ;
    if(html_options.multipart == true) {
        html_options.method = 'post';
        html_options.enctype = 'multipart/form-data';
    }
    
    html_options.onsubmit = html_options.onsubmit+"return EjsView.post_form(this, "+$H(url_for_options).toJSON()+");";
    
    return this.start_tag_for('form', html_options)
}


/**
 * Outputs "&lt;/form&gt;".
 * @return {String} "&lt;/form&gt;" .
 */
EjsView.form_tag_end = function() { return this.tag_end('form'); }

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
EjsView.form_tag_external = function(action, html_options) {
    html_options     = html_options                     || {};
    html_options.action = action
    return this.start_tag_for('form', html_options)
}
/**
 * Creates a hidden field.
 * <p>Example:</p>
 * <pre class='example'>
 *  view.hidden_field_tag('hidden_value')</pre>
 * <p>produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *   document.write( view.hidden_field_tag('hidden_value').escapeHTML() ) ;
 * </script></pre>
 * @param {String} name Form element's name
 * @param {String} value Default value
 * @param {Object} html_options Options used to create html attributes.
 *
 * @return {String} Text for an hidden field element.
 *
 */
EjsView.hidden_field_tag   = function(name, value, html_options) { 
    return this.input_field_tag(name, value, 'hidden', html_options); 
}


/**
 * Creates html input elements.
 * <p>input field also creates elements in the correct way so their values can be automatically put into 
 * post data and sent on form submital.</p>
 * <p>Example:</p>
 * <pre class='example'>
 *  view.input_field_tag('task', 'description','text') </pre>
 * <p>Produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *   document.write( view.input_field_tag('task', 'description','text').escapeHTML() ) ;
 * </script>
 * Which looks like =>
 * <script language="javascript" type="text/javascript">
 *   document.write( view.input_field_tag('task', 'description','text') ) ;
 * </script></pre>
 * @param {String} name Form element's name
 * @param {String} value The default value of the form element.
 * @param {String} inputType The type of input object ('text', 'hidden', 'password')
 * @param {Object} html_options Options used to create html attributes.
 *
 * @return {String} input field text.
 *
 */
EjsView.input_field_tag = function(name, value , inputType, html_options) {
    
    html_options = html_options || {};
    html_options.id  = html_options.id  || name;
    html_options.value = value || '';
    html_options.type = inputType || 'text';
    html_options.name = name;
    
    return this.single_tag_for('input', html_options)
}
/**
 * Returns true if parameters in options match the parameters of the current page.
 * @param {Object} options
 */
EjsView.is_current_page = function(options) {
	if(typeof options == 'string'){
		return (window.location.href == options || window.location.pathname == options ? true : false);
	}
	
	options = $H(options) || $H(); //prototype
	
	var options_extended = Object.extend(Object.clone(JMVC.Routes.params()), options);
	
	return (this.url_for(options_extended) == this.url_for(JMVC.Routes.params()) ? true : false)
}

/**
 * Creates a link tag of the given name using a URL created by the set of options. 
 * 
 * <p>Example:</p>
 * <pre class='example'>
 * view.link_to('Link to Local Action', {controller: 'tasks', action: 'list'} ) </pre>
 * <p>Produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *    document.write(  view.link_to('Link to Local Action', {controller: 'tasks', action: 'list'} ).escapeHTML() );
 * </script>
 * Looks like =>
 * <script language="javascript" type="text/javascript">
 *    document.write(  view.link_to('Link to Local Action', {controller: 'tasks', action: 'list'} ) );
 * </script></pre>
 * @param {String} name link's text.
 * @param {String} options URL parameters.
 * @param {String} html_options Hash of html attributes.
 *  <p>NOTE: to add a "class" attribute use "Class" (capitalized) because "class" is a reserved word in IE</p>
 * <pre class='example'>
 * view.link_to('Some Link', {action: 'list'}, {Class: 'highlighted'})</pre>
 * @param {Boolean} post true if link submits a post request, false if link submits a get request.  Default is false. 
 *
 * @return {String} hyperlink text.
 *
 */
EjsView.link_to = function(name, options, html_options, post) {
    if(!name) var name = 'null';
    if(!html_options) var html_options = {}
    //html_options.onclick = html_options.onclick  || '' ;
	
	if(html_options.confirm){
		html_options.onclick = 
		" var ret_confirm = confirm(\""+html_options.confirm+"\"); if(!ret_confirm){ return false;} "
		html_options.confirm = null;
	}
	if(typeof options == 'string'){
		html_options.href=options
		return this.start_tag_for('a', html_options)+name+ this.tag_end('a');
	}
	
	
	options = options || {}
	if(!options.action)
		options.action = JMVC.Routes.params().action
		
    if(!options.controller)
		options.controller = JMVC.Routes.params().controller

	EjsView.link_to_onclick_and_href(html_options, options, post);
	
    return this.start_tag_for('a', html_options)+name+ this.tag_end('a');
}

// adds the onclick and href attributes for the html_options
// separated to allow history library to override this functionality easily
EjsView.link_to_onclick_and_href = function(html_options, options, post) {
    if(html_options.onclick == null) html_options.onclick = '';
	
	html_options.onclick=html_options.onclick+(options ? this.url_for(options, post) : '')+'return false;';
    html_options.href='#'
}


/**
 * 
 * @param {Object} name
 * @param {Object} options
 * @param {Object} html_options
 */
EjsView.submit_link_to = function(name, options, html_options, post){
	if(!name) var name = 'null';
    if(!html_options) html_options = {}
	html_options.type = 'submit';
    html_options.value = name;
	html_options.onclick = html_options.onclick  || '' ;
	
	if(html_options.confirm){
		html_options.onclick = 
		" var ret_confirm = confirm(\""+html_options.confirm+"\"); if(!ret_confirm){ return false;} "
		html_options.confirm = null;
	}
	if(typeof options == 'string'){
		html_options.onclick=html_options.onclick+';window.location="'+options+'";'
		return this.single_tag_for('input', html_options)
	}
	
	
	options = options || {}
	if(!options.action)
		options.action = JMVC.Routes.params().action
		
    if(!options.controller)
		options.controller = JMVC.Routes.params().controller

	EjsView.link_to_onclick_and_href(html_options, options, post);
	
	
	
    return this.single_tag_for('input', html_options)+name+ this.tag_end('a');
}
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
EjsView.link_to_external = function(text, path, html_options) {
    if(!html_options) var html_options = {}
    html_options.href=path
    return this.start_tag_for('a', html_options)+text+ this.tag_end('a');
}
/**
 * Creates a link tag of the given name using a URL 
 * created by the set of options if the condition is true.  If the condition is false, 
 *  only the name is returned. 
 * To specialize the default behavior, you can pass a function that accepts 
 * the name or the full argument list for link_to_unless (see the example).
 * @param {Object} condition
 * @param {Object} name
 * @param {Object} options
 * @param {Object} html_options
 * @param {Object} post
 * @param {Object} block
 * @see #link_to_unless
 */
EjsView.link_to_if = function(condition, name, options, html_options, post, block) {
	return this.link_to_unless((condition == false), name, options, html_options, post, block);
}

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
EjsView.link_to_unless = function(condition, name, options, html_options, post, block) {
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
}

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
 */
EjsView.link_to_unless_current = function(name, options, html_options, post, block) {
	options = options || {};
	html_options = html_options || {};
	return this.link_to_unless(this.is_current_page(options), name, options, html_options, post, block)
}





/**
 * Packages a form data into a hash.  Each input element's value is
 * added into the hash by name.  Input elements with names like task[description] are packaged
 * accordingly in the object (accessed as .task.description).
 * 
 * <p>Example:</p>
 * <pre class='example'>
 * view.form_tag( null , {id: 'myForm' } )
 * view.text_field_tag( 'task[description]', 'A description of the task')
 * view.form_tag_end()
 * view.link_to( 'Click for Value', 
 *               null, 
 *               { onclick: 'alert(view.package_form("myForm" ).task.description );' } )</pre>
 * <p>Produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *    document.write(   view.form_tag( null , {id: 'myForm' } )  );
 *    document.write(   view.text_field_tag( 'task[description]', 'A description of the task')  );
 *    document.write(   view.form_tag_end()  );
 *    document.write(  view.link_to('Click for Value', null, {onclick: 'alert(view.package_form("myForm" ).task.description );'   } ) );
 * </script></pre>
 * @param {String/Node} form_element The form element or element's id.
 * @param {String} options A object to package the form data into.  If none is provided, it will add to a empty object.
 * @param {String} submit_button_name The name of the submit button or other input element to ignore.  By default, package_form ignores
 *                                    all inputs with type submit.
 *
 * @return {Object} Object containing packaged form data.
 */

EjsView.package_form = function(form_element, options, submit_button_name) {
    if(!options) var options = {};
    if(typeof form_element == 'string') form_element = document.getElementById(form_element)
    
    if (form_element != null) {
        for (var i = 0; i < form_element.elements.length; i++) {
            var element = form_element.elements[i];
            if (element.type != "submit" || element.name == submit_button_name) {
                if(element.type == "radio") {
                    if (element.checked == true)
                        EjsView.set_map_tree_value(options, element.name, element.value);
                } else {
                    var value = (element.type == "checkbox" ? element.checked : element.value);
                    EjsView.set_map_tree_value(options, element.name, value);
                }
            }
        }
        return options;
    }
}

/**
 * Creates a password field.
 * <p>Example:</p>
 * <pre class='example'>
 *  view.password_field_tag('password', 'mypassword')</pre>
 * <p>produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *   document.write( view.password_field_tag('password', 'mypassword').escapeHTML() ) ;
 * </script>
 * Looks like => 
 * <script language="javascript" type="text/javascript">
 *   document.write( view.password_field_tag('password', 'mypassword') ) ;
 * </script></pre>
 * @param {String} name Form element's name
 * @param {String} value Default value
 * @param {Object} html_options Options used to create html attributes.
 *
 * @return {String} password field text.
 *
 */
EjsView.password_field_tag = function(name, value, html_options) { return this.input_field_tag(name, value, 'password', html_options); }


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
EjsView.post_form = function(form_element, options, submit_button_name) {
    EjsView.send_form_to_server = false;
    // hash of file fields with their ids as the value
    EjsView.insert_id_into_form = true;
    post( this.package_form( form_element, options, submit_button_name ) );
    var insert_id_into_form = EjsView.insert_id_into_form;
    delete EjsView.insert_id_into_form;
    if(EjsView.send_form_to_server == true) { // set up form for server
        new Insertion.Top(document.body, "<iframe id='upload_frame' name='upload_frame' style='display:none' onload='JMVC.Dispatcher.resume_execution();'></iframe>")
        form_element.setAttribute('target', 'upload_frame');
        form_element.setAttribute('action', '/'+JMVC.app_info.client.name+'/'+JMVC.app_info.project.name+'/file_upload');
        // look for all file ids to place into the form
        if(insert_id_into_form)
            new Insertion.Top(form_element, '<input type="hidden" '+
                'name="'+insert_id_into_form.model+'[id]" value="'+insert_id_into_form.id+'" />');
        return true;
    }
    return false;
}

/**
 * Creates a select field.
 * <p>Example:</p>
 * <pre class='example'>
 * var choices = [ {value: 1,      text: 'First Choice' }, 
 *                 {value: 2,      text: 'Second Choice'},
 *                 {value: '3',    text: 'Third Choice'}  ]
 * view.select_tag('mySelectElement', 2,  choices)</pre>
 * <p>Produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *    var choices = [ {value: 1,      text: 'First Choice' }, 
 *                   {value: 2,      text: 'Second Choice'},
 *                   {value: '3',    text: 'Third Choice'}   ]
 *   document.write( view.select_tag('mySelectElement', 2,  choices));
 * </script>
 * </pre>
 *
 * @param {String} name Form element's name.
 * @param {String} value Optional default value.
 * @param {Object} choices An array of choices.  Each choice is an object with a name and value attribute.
 * @param {Object} html_options Options used to create html attributes.
 *
 * @return {String} select tag text.
 */
EjsView.select_tag = function(name, value, choices, html_options) {     
    html_options = html_options || {};
    html_options.id  = html_options.id  || name;
    html_options.value = value;
	html_options.name = name;
    
    var txt = ''
    txt += this.start_tag_for('select', html_options)
    
    for(var i = 0; i < choices.length; i++)
    {
        var choice = choices[i];
        var optionOptions = {value: choice.value}
        if(choice.value == value)
            optionOptions.selected ='selected'
        txt += this.start_tag_for('option', optionOptions )+choice.text+this.tag_end('option')
    }
    txt += this.tag_end('select');
    return txt;
}
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
EjsView.set_map_tree_value = function(mapTree, path, value) { // Example path is 'order[customer][name]'.
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
}

/**
 * Creates tag that ends with '/>'.  Use this to create html elements that have no ending tag.
 * <p>Example:
 * <pre class='example'>
 * view.single_tag_for('br')  ==>  returns <script language="javascript" type="text/javascript">
 *   document.write( view.single_tag_for('br').escapeHTML() ) ;
 * </script></pre>
 * @param {String} tag Html tag type {'br', 'input', ...}
 * @param {Object} html_options Options used to create html attributes.
 *
 * @return {String} html markup for a tag
 */
EjsView.single_tag_for = function(tag, html_options) { return this.tag(tag, html_options, '/>');}

/**
 * Creates tag that ends with '>'.  Use this to create html elements that have other markup or 
 * inner text.
 * <p>Example:
 * <pre class='example'>
 * view.start_tag_for('p', {class: 'background-color: Red'})  ==>  returns '&lt;p class="background-color: Red" &gt;'</pre>
 * @param {String} tag Html tag type {'span', 'div', 'p', ...}
 * @param {Object} html_options Options used to create html attributes.
 *  <p>NOTE: to add a "class" attribute use "Class" (capitalized) because "class" is a reserved word in IE</p>
 * <pre class='example'>
 * view.start_tag_for('p', {Class: 'highlighted'})  ==>  returns '&lt;p class="highlighted" &gt;'</pre>
 *
 * @return {String} html markup for a tag
 */
EjsView.start_tag_for = function(tag, html_options)  { return this.tag(tag, html_options); }

EjsView.submit_tag = function(name, html_options) {  
    html_options = html_options || {};
    html_options.name  = html_options.id  || 'commit';
    html_options.type = html_options.type  || 'submit';
    html_options.value = name || 'Submit';
    return this.single_tag_for('input', html_options);
}

/**
 * Creates a html tag.
 * <p>Example:
 * <pre class='example'>
 * view.tag('p', {style: 'background-color: Red'})  ==>  returns '&lt;p style="background-color: Red" &gt;'</pre>
 * @param {String} tag Html tag type {'br', 'input', 'span', 'div', ...}
 * @param {Object} html_options Options used to create html attributes.
 *  <p>NOTE: to add a "class" attribute use "Class" (capitalized) because "class" is a reserved word in IE</p>
 * <pre class='example'>
 * view.tag('p', {Class: 'highlighted'})  ==>  returns '&lt;p class="highlighted" &gt;'</pre>
 * @param {String} end End of the html tag.  Defaults to '>'.
 *
 * @return {String} html markup for a tag
 */
EjsView.tag = function(tag, html_options, end) {
    if(!end) var end = '>'
    var txt = ' '
    for(var attr in html_options) { 
       if(html_options[attr] != null)
        var value = html_options[attr].toString();
       else
        var value=''
       if(attr == "Class") // special case because "class" is a reserved word in IE
        attr = "class";
       if( value.indexOf("'") != -1 )
            txt += attr+'=\"'+value+'\" ' 
       else
            txt += attr+"='"+value+"' " 
    }
    return '<'+tag+txt+end;
}
/**
 * Creates an ending html tag.
 * @param {String} tag Html tag type {'span', 'div', 'p', ...}
 * @return {String} '&lt;/'+tag+'&gt;'
 */
EjsView.tag_end = function(tag)             { return '</'+tag+'>'; }

/**
 * Creates a textarea.
 * <p>Example:</p>
 * <pre class='example'>
 *  view.text_area_tag('myTextArea', 'Here is some text.\nA new line.')</pre>
 * <p>produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *   document.write( view.text_area_tag('task[description]', 'Here is some text.\nA new line.') ) ;
 * </script>
 * </pre>
 * @param {String} name Form element's name.
 * @param {String} value Default value.
 * @param {Object} html_options Options used to create html attributes.  Uses the following:
 *      <ul>
 *          <li>size - A string specifying the dimensions of the textarea.  Ex: {size: '25x10'}</li>
 *      </ul>
 *
 * @return {String} password field text.
 *
 */
EjsView.text_area_tag = function(name, value, html_options) { 
    html_options = html_options || {};
    html_options.id  = html_options.id  || name;
    html_options.name  = html_options.name  || name;
	value = value || ''
    if(html_options.size) {
        html_options.cols = html_options.size.split('x')[0]
        html_options.rows = html_options.size.split('x')[1]
        delete html_options.size
    }
    
    html_options.cols = html_options.cols  || 50;
    html_options.rows = html_options.rows  || 4;
    
    return  this.start_tag_for('textarea', html_options)+value+this.tag_end('textarea')
}
EjsView.text_tag = EjsView.text_area_tag
/**
 * Creates a standard text field.
 * <p>Example:</p>
 * <pre class='example'>
 * view.text_field_tag('myTextField', 'Here is some text.')</pre>
 * <p>produces:</p>
 * <pre class='example'>
 * <script language="javascript" type="text/javascript">
 *   document.write( view.text_field_tag('myTextField', 'Here is some text.') ) ;
 * </script>
 * </pre>
 * @param {String} name Form element's name.
 * @param {String} value Default value.
 * @param {Object} html_options Options used to create html attributes.  Uses the following:
 *
 * @return {String} password field text.
 *
 */
EjsView.text_field_tag     = function(name, value, html_options) { return this.input_field_tag(name, value, 'text', html_options); }

/**
 * Creates human readable text using basic types
 * @param input The javascript object to be converted to text.
 * @param {String} null_text The string to display in case the input is null
 * @return {String} a string representation of whatever was passed in
 */
EjsView.to_text = function(input, null_text) {
    if(input == null || input === undefined)
        return null_text || '';
    if(input instanceof Date)
		return input.toDateString();
	if(input.toString) 
        return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'")
	
	return '';
}
/**
 * Updates options with controller and action attributes.
 * <p>This is primarly used by url_for to provide a default controller for actions.</p>
 * @param {Object} A url hash.
 * @private
 */
EjsView.update_with_controller_and_action = function(options) {
      if(!options)
        options= {};
      if(!options.controller)
        options.controller = JMVC.Routes.params()['controller'];
      if(!options.action)
        options.action = JMVC.Routes.params()['action'];
}

/**
 * Updates options with controller and action attributes.
 * <p>This is primarly used by url_for to provide a default controller for actions.</p>
 * @param {Object} A url hash.
 */
EjsView.update_with_client_and_project = function(options) {
      if(!options)
        options= {};
      if(!options.action)
        options.action = 'index';
      if(!options.controller)
        options.project = JMVC.Routes.params()['controller'];
}
/**
 * Returns javascript text that when run will call a controller action with parameters defined in params.
 * <p>This is primarly used for adding to onclick or other functions when creating templates.</p>
 * @param {Object} A url hash.
 * @param {Boolean} post true if a post request, false if otherwise.  Default is a get request.
 * @return {String} request function.
 */
EjsView.url_for = function(params, post) {
    this.update_with_controller_and_action(params);
    if(post == true)
        return 'post(' + $H(params).toJSON() + ');' //prototype
    else
        return 'get(' + $H(params).toJSON() + ');' //prototype
}
/**
 * uses the type of column to deterimine the type of field it should present.  Useful in bluepritns.
 * @param {Object} model_name
 * @param {Object} column_name
 * @param {Object} options
 */
EjsView.input = function(model_name, column_name, options) {
	options = options || {};
	options.value = options.value || '';
	var type = window[model_name].columns_hash()[column_name].sql_type;
	if(this[type+'_tag'])
		return this[type+'_tag'](model_name+'['+column_name+']', options.value, options);
	return this.text_field_tag(model_name+'['+column_name+']', options.value, options);	
}

EjsView.img_tag = function(image_location, options){
	options = options || {};
	options.src = new jFile( jFile.join("public/images/",image_location) ).absolute()
	return EjsView.single_tag_for('img', options)
	//return "<img src='"+APPLICATION_ROOT+"/public/images/"+image_location+"'/>"
}

EjsView.HandlerObject = function(value) {
	this.value = value;
}

EjsView.HandlerObject.prototype = {
	toJSON : function() {
		return this.value;
	}
}