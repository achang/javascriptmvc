MVC.Controller('todos',{
	mouseover : function(params){
		params.element.style.backgroundColor = '#8FBA3C';
	},
	mouseout : function(params){						
		params.element.style.backgroundColor = '';
	},
	'label click' : function(params){
		if(params.element.childNodes[0].nodeType != 1)
		params.element.innerHTML = 
			'<input type="text" class="text" value="'+params.element.innerHTML+'"/>';
		// weird Firefox bug
		if(MVC.Browser.Gecko) params.element.firstChild.setAttribute('autocomplete','off');
		params.element.firstChild.focus();
		params.element.className='working';
	},
	'label input blur' : function(params){
		var label = params.element.parentNode;
		label.innerHTML = params.element.value;
		label.className='';
	},
	'label input keypress' : function(params){
		var keyCode = params.event.keyCode;
		if(typeof keyCode == 'undefined'){ //IE
			if(params.event.charCode == 13) this['label input blur'](params);
		}else if(keyCode == 13) 
			this['label input blur'](params);
	},
	'img click' :function(params){
		params.class_element().parentNode.removeChild(params.class_element());
	},
	'.check click' : function(params){
		if(params.element.checked)
			params.class_element().style.color = 'gray';
		else
			params.class_element().style.color = '';
	},
	'# .new input focus' : function(params){
		params.element.value = '';
		params.element.style.color = '';
	},
	'# .new input keypress' : function(params) {
		// insert stuff here
	},
	'# .new input blur' : function(params){
		if(params.element.value != '' && params.element.value != 'type new todo here'){
			MVC.Element.insert('todo_form',
				{after: "<div class='todo'><img src='../../images/close.png' alt='close'/><input type='checkbox' class='check'/><label>"+params.element.value+
				"</label><p class='clear'> </p></div>"}
			);
		}
		params.element.style.color = 'gray';
		params.element.value = 'type new todo here';
	},
	'# form submit' : function(params){
		params.event.kill();
		params.element = MVC.Element('new_todo');
		this['# .new input blur'](params);
		params.element.style.color = '';
		params.element.value = '';
		params.element.focus();
	}
});