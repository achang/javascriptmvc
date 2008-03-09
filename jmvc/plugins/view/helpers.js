
$MVC.View.Helpers.prototype.date_tag = function(name, value , html_options) {
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

$MVC.View.Helpers.prototype.file_tag = function(name, value, html_options) {
    return this.input_field_tag(name+'[file]', value , 'file', html_options);
};

$MVC.View.Helpers.prototype.form_tag = function(url_for_options, html_options) {
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
    
    html_options.onsubmit = html_options.onsubmit+"return $MVC.View.Helpers.prototype.post_form(this, "+$H(url_for_options).toJSON()+");";
    
    return this.start_tag_for('form', html_options);
};

$MVC.View.Helpers.prototype.form_tag_end = function() { return this.tag_end('form'); };


$MVC.View.Helpers.prototype.hidden_field_tag   = function(name, value, html_options) { 
    return this.input_field_tag(name, value, 'hidden', html_options); 
};

$MVC.View.Helpers.prototype.input_field_tag = function(name, value , inputType, html_options) {
    
    html_options = html_options || {};
    html_options.id  = html_options.id  || name;
    html_options.value = value || '';
    html_options.type = inputType || 'text';
    html_options.name = name;
    
    return this.single_tag_for('input', html_options);
};


$MVC.View.Helpers.prototype.link_to = function(name, options, html_options) {
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

	$MVC.View.Helpers.prototype.link_to_onclick_and_href(html_options, options, post);
	
    return this.start_tag_for('a', html_options)+name+ this.tag_end('a');
};

// adds the onclick and href attributes for the html_options
// separated to allow history library to override this functionality easily
$MVC.View.Helpers.prototype.link_to_onclick_and_href = function(html_options, options, post) {
    if(html_options.onclick == null) html_options.onclick = '';
	
	html_options.onclick=html_options.onclick+(options ? this.url_for(options, post) : '')+'return false;';
    html_options.href='#';
};

$MVC.View.Helpers.prototype.submit_link_to = function(name, options, html_options, post){
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

	$MVC.View.Helpers.prototype.link_to_onclick_and_href(html_options, options, post);
    return this.single_tag_for('input', html_options)+name+ this.tag_end('a');
};

$MVC.View.Helpers.prototype.link_to_if = function(condition, name, options, html_options, block) {
	return this.link_to_unless((condition == false), name, options, html_options, null, block);
};

$MVC.View.Helpers.prototype.password_field_tag = function(name, value, html_options) { return this.input_field_tag(name, value, 'password', html_options); };

$MVC.View.Helpers.prototype.select_tag = function(name, value, choices, html_options) {     
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

$MVC.View.Helpers.prototype.single_tag_for = function(tag, html_options) { return this.tag(tag, html_options, '/>');};


$MVC.View.Helpers.prototype.start_tag_for = function(tag, html_options)  { return this.tag(tag, html_options); };

$MVC.View.Helpers.prototype.submit_tag = function(name, html_options) {  
    html_options = html_options || {};
    html_options.name  = html_options.id  || 'commit';
    html_options.type = html_options.type  || 'submit';
    html_options.value = name || 'Submit';
    return this.single_tag_for('input', html_options);
};


$MVC.View.Helpers.prototype.tag = function(tag, html_options, end) {
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

$MVC.View.Helpers.prototype.tag_end = function(tag)             { return '</'+tag+'>'; };

$MVC.View.Helpers.prototype.text_area_tag = function(name, value, html_options) { 
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
$MVC.View.Helpers.prototype.text_tag = $MVC.View.Helpers.prototype.text_area_tag;

$MVC.View.Helpers.prototype.text_field_tag     = function(name, value, html_options) { return this.input_field_tag(name, value, 'text', html_options); };

$MVC.View.Helpers.prototype.to_text = function(input, null_text) {
    if(input == null || input === undefined)
        return null_text || '';
    if(input instanceof Date)
		return input.toDateString();
	if(input.toString) 
        return input.toString().replace(/\n/g, '<br />').replace(/''/g, "'");
	
	return '';
};


$MVC.View.Helpers.prototype.img_tag = function(image_location, options){
	options = options || {};
	options.src = "resources/images/"+image_location;
	return this.single_tag_for('img', options);
	//return "<img src='"+APPLICATION_ROOT+"/public/images/"+image_location+"'/>"
};



(function(){
	var data = {};
	var name = 0;
	$MVC.View.Helpers.link_data = function(store){
		var functionName = name++;
		data[functionName] = store;	
		return "_data='"+functionName+"'";
	};
	$MVC.View.Helpers.get_data = function(el){
		if(!el) return null;
		var dataAt = el.getAttribute('_data');
		if(!dataAt) return null;
		return data[parseInt(dataAt)];
	};
	$MVC.View.Helpers.prototype.link_data = function(store){
		return $MVC.View.Helpers.link_data(store)
	};
	$MVC.View.Helpers.prototype.get_data = function(el){
		return $MVC.View.Helpers.get_data(el)
	};
})()


