


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
View.Helpers.prototype.date_tag = function(name, value , html_options) {
    if(! (value instanceof Date))
		value = new Date();
	
	var years = [], months = [], days =[];
	var year = value.getFullYear();
	var month = value.getMonth();
	var day = value.getDate();
	for(var y = year - 15; y < year+15 ; y++)
	{
		years.push({value: y, text: y});
	}
	for(var m = 0; m < 12; m++)
	{
		months.push({value: (m), text: Date.month_names[m]});
	}
	for(var d = 0; d < 31; d++)
	{
		days.push({value: (d+1), text: (d+1)});
	}
	var year_select = this.select_tag(name+'[year]', year, years, {id: name+'[year]'} );
	var month_select = this.select_tag(name+'[month]', month, months, {id: name+'[month]'});
	var day_select = this.select_tag(name+'[day]', day, days, {id: name+'[day]'});
	
    return year_select+month_select+day_select;
};

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
View.Helpers.prototype.file_tag = function(name, value, html_options) {
    return this.input_field_tag(name+'[file]', value , 'file', html_options);
};

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
View.Helpers.prototype.form_tag = function(url_for_options, html_options) {
    html_options     = html_options                     || {};
	if(html_options.multipart == true) {
        html_options.method = 'post';
        html_options.enctype = 'multipart/form-data';
    }
		
	if(typeof url_for_options == 'string'){
		html_options.action = url_for_options;
	    return this.start_tag_for('form', html_options);
	}
	
	url_for_options     = url_for_options                     || {};
    this.update_with_controller_and_action(url_for_options);
    
    html_options.onsubmit     = html_options.onsubmit                     || '' ;
    if(html_options.multipart == true) {
        html_options.method = 'post';
        html_options.enctype = 'multipart/form-data';
    }
    
    html_options.onsubmit = html_options.onsubmit+"return View.Helpers.prototype.post_form(this, "+$H(url_for_options).toJSON()+");";
    
    return this.start_tag_for('form', html_options);
};


/**
 * Outputs "&lt;/form&gt;".
 * @return {String} "&lt;/form&gt;" .
 */
View.Helpers.prototype.form_tag_end = function() { return this.tag_end('form'); };


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
View.Helpers.prototype.hidden_field_tag   = function(name, value, html_options) { 
    return this.input_field_tag(name, value, 'hidden', html_options); 
};


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
View.Helpers.prototype.input_field_tag = function(name, value , inputType, html_options) {
    
    html_options = html_options || {};
    html_options.id  = html_options.id  || name;
    html_options.value = value || '';
    html_options.type = inputType || 'text';
    html_options.name = name;
    
    return this.single_tag_for('input', html_options);
};


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
View.Helpers.prototype.link_to = function(name, options, html_options) {
    if(!name) var name = 'null';
    if(!html_options) var html_options = {};
    //html_options.onclick = html_options.onclick  || '' ;
	
	if(html_options.confirm){
		html_options.onclick = 
		" var ret_confirm = confirm(\""+html_options.confirm+"\"); if(!ret_confirm){ return false;} ";
		html_options.confirm = null;
	}
	if(typeof options == 'string'){
		html_options.href=options;
		return this.start_tag_for('a', html_options)+name+ this.tag_end('a');
	}
	
	
	//options = options || {};
	//if(!options.action)
	//	options.action = JMVC.Routes.params().action;
		
    //if(!options.controller)
	//	options.controller = JMVC.Routes.params().controller;

	View.Helpers.prototype.link_to_onclick_and_href(html_options, options, post);
	
    return this.start_tag_for('a', html_options)+name+ this.tag_end('a');
};

// adds the onclick and href attributes for the html_options
// separated to allow history library to override this functionality easily
View.Helpers.prototype.link_to_onclick_and_href = function(html_options, options, post) {
    if(html_options.onclick == null) html_options.onclick = '';
	
	html_options.onclick=html_options.onclick+(options ? this.url_for(options, post) : '')+'return false;';
    html_options.href='#';
};


/**
 * 
 * @param {Object} name
 * @param {Object} options
 * @param {Object} html_options
 */
View.Helpers.prototype.submit_link_to = function(name, options, html_options, post){
	if(!name) var name = 'null';
    if(!html_options) html_options = {};
	html_options.type = 'submit';
    html_options.value = name;
	html_options.onclick = html_options.onclick  || '' ;
	
	if(html_options.confirm){
		html_options.onclick = 
		" var ret_confirm = confirm(\""+html_options.confirm+"\"); if(!ret_confirm){ return false;} ";
		html_options.confirm = null;
	}
	if(typeof options == 'string'){
		html_options.onclick=html_options.onclick+';window.location="'+options+'";';
		return this.single_tag_for('input', html_options);
	}
	
	
	options = options || {};
	if(!options.action)
		options.action = JMVC.Routes.params().action;
		
    if(!options.controller)
		options.controller = JMVC.Routes.params().controller;

	View.Helpers.prototype.link_to_onclick_and_href(html_options, options, post);
	
	
	
    return this.single_tag_for('input', html_options)+name+ this.tag_end('a');
};

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
View.Helpers.prototype.link_to_if = function(condition, name, options, html_options, block) {
	return this.link_to_unless((condition == false), name, options, html_options, null, block);
};










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
View.Helpers.prototype.password_field_tag = function(name, value, html_options) { return this.input_field_tag(name, value, 'password', html_options); };



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
View.Helpers.prototype.select_tag = function(name, value, choices, html_options) {     
    html_options = html_options || {};
    html_options.id  = html_options.id  || name;
    html_options.value = value;
	html_options.name = name;
    
    var txt = '';
    txt += this.start_tag_for('select', html_options);
    
    for(var i = 0; i < choices.length; i++)
    {
        var choice = choices[i];
        var optionOptions = {value: choice.value};
        if(choice.value == value)
            optionOptions.selected ='selected';
        txt += this.start_tag_for('option', optionOptions )+choice.text+this.tag_end('option');
    }
    txt += this.tag_end('select');
    return txt;
};


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
View.Helpers.prototype.single_tag_for = function(tag, html_options) { return this.tag(tag, html_options, '/>');};

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
View.Helpers.prototype.start_tag_for = function(tag, html_options)  { return this.tag(tag, html_options); };

View.Helpers.prototype.submit_tag = function(name, html_options) {  
    html_options = html_options || {};
    html_options.name  = html_options.id  || 'commit';
    html_options.type = html_options.type  || 'submit';
    html_options.value = name || 'Submit';
    return this.single_tag_for('input', html_options);
};

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
View.Helpers.prototype.tag = function(tag, html_options, end) {
    if(!end) var end = '>';
    var txt = ' ';
    for(var attr in html_options) { 
       if(html_options.hasOwnProperty(attr)){
	   	
	   
	   if(html_options[attr] != null)
        var value = html_options[attr].toString();
       else
        var value='';
       if(attr == "Class") // special case because "class" is a reserved word in IE
        attr = "class";
       if( value.indexOf("'") != -1 )
            txt += attr+'=\"'+value+'\" ' ;
       else
            txt += attr+"='"+value+"' " ;
	   }
    }
    return '<'+tag+txt+end;
};
/**
 * Creates an ending html tag.
 * @param {String} tag Html tag type {'span', 'div', 'p', ...}
 * @return {String} '&lt;/'+tag+'&gt;'
 */
View.Helpers.prototype.tag_end = function(tag)             { return '</'+tag+'>'; };

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
View.Helpers.prototype.text_area_tag = function(name, value, html_options) { 
    html_options = html_options || {};
    html_options.id  = html_options.id  || name;
    html_options.name  = html_options.name  || name;
	value = value || '';
    if(html_options.size) {
        html_options.cols = html_options.size.split('x')[0];
        html_options.rows = html_options.size.split('x')[1];
        delete html_options.size;
    }
    
    html_options.cols = html_options.cols  || 50;
    html_options.rows = html_options.rows  || 4;
    
    return  this.start_tag_for('textarea', html_options)+value+this.tag_end('textarea');
};
View.Helpers.prototype.text_tag = View.Helpers.prototype.text_area_tag;
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
View.Helpers.prototype.text_field_tag     = function(name, value, html_options) { return this.input_field_tag(name, value, 'text', html_options); };

/**
 * Creates human readable text using basic types
 * @param input The javascript object to be converted to text.
 * @param {String} null_text The string to display in case the input is null
 * @return {String} a string representation of whatever was passed in
 */
View.Helpers.prototype.to_text = function(input, null_text) {
    if(input == null || input === undefined)
        return null_text || '';
    if(input instanceof Date)
		return input.toDateString();
	if(input.toString) 
        return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'");
	
	return '';
};


View.Helpers.prototype.img_tag = function(image_location, options){
	options = options || {};
	options.src = "resources/images/"+image_location;
	return this.single_tag_for('img', options);
	//return "<img src='"+APPLICATION_ROOT+"/public/images/"+image_location+"'/>"
};



(function(){
	var data = {};
	var name = 0;
	View.Helpers.link_data = function(store){
		var functionName = name++;
		data[functionName] = store;	
		return "_data='"+functionName+"'";
	};
	View.Helpers.get_data = function(el){
		if(!el) return null;
		var dataAt = el.getAttribute('_data');
		if(!dataAt) return null;
		return data[parseInt(dataAt)];
	};
})()


