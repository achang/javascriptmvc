var SelectableRow = function(params){
	params = params || {};
	var selectable_row_class = params.selectable_row_class || 'selectable';
	var pluralized_selectable_row_class = selectable_row_class.pluralize();
	var selected_row_class = params.selected_row_class || 'selected';
	var mouseover = params.mouseover || false;
	var controller_name = pluralized_selectable_row_class.classize()+'Controller';
	window[controller_name] = MVC.Controller.extend(pluralized_selectable_row_class,{
		click: function(params){
			this.select_row(params.element);
			params.element.focus();
		},
		select_row: function(el){
			var rows = this.get_selectable_elements();
			// search for any call that is selected
			// toggle its class to turn it off
			for(var i=0; i<rows.length; i++){
				var row = rows[i];
				if(!MVC.$E.elements_match(el, row) && MVC.$E.has_class(row,selected_row_class))
					MVC.$E.toggle_class(row, selected_row_class);
			}
			if(!MVC.String.include(el.className,selected_row_class))
				MVC.$E.toggle_class(el, selected_row_class);
		},
		mouseover: function(params){
			if (mouseover) {
				params.element.focus();
				this.select_row(params.element);
			}
		},
		get_selectable_elements: function(){
			return MVC.Query('.'+selectable_row_class);
		},
		get_selected_elements: function(){
			return MVC.Query('.'+selected_row_class);
		},
		// if no row selected, select the first
		select_row_if_nothing_selected: function(params){
			var selected = this.get_selected_elements();
			if (selected.length > 0) return;
			var rows = this.get_selectable_elements();
			if(rows.length > 0)
				rows[0].className += ' '+selected_row_class;
		},
		// remove a row and select another
		remove_row: function(el){
			this.select_another_row(el);
			el.parentNode.removeChild(el);
		},
		select_another_row: function(el){
			if(!el) return;
			var selected = MVC.$E.has_class(el, selected_row_class);
			if(!selected) return;
			var prev_sibling = MVC.$E.previous_sibling_in_class(el, selectable_row_class);
			if(prev_sibling)
				MVC.$E.toggle_class(prev_sibling, selected_row_class);
			else {
				var els = this.get_selectable_elements();
				if(MVC.$E.elements_match(els[0], el))
					MVC.$E.toggle_class(els[els.length-1], selected_row_class);
			}
		},
		keydown: function(params){
			var keycode = params.event.keyCode;
			if(keycode == 38)
				return this.select_row_above();
			if(keycode == 40)
				return this.select_row_below();
		},
		select_row_above: function(){
			var selected_row = this.get_selected_elements()[0];
			var prev_sibling = MVC.$E.previous_sibling_in_class(selected_row, selectable_row_class);
			if (prev_sibling) 
				this.select_row(prev_sibling);
			else {
				var selectable_rows = this.get_selectable_elements();
				this.select_row(selectable_rows[selectable_rows.length-1]);
			}
		},
		select_row_below: function(){
			var selected_row = this.get_selected_elements()[0];
			var next_sibling = MVC.$E.next_sibling_in_class(selected_row, selectable_row_class);
			if (next_sibling) 
				this.select_row(next_sibling);
			else {
				var selectable_rows = this.get_selectable_elements();
				this.select_row(selectable_rows[0]);
			}
		}
	});
	this.select_row_if_nothing_selected = function() {
		MVC.Controller.dispatch(pluralized_selectable_row_class.classize(), 
			'select_row_if_nothing_selected');
	}
	this.remove_row = function(element) {
		MVC.Controller.dispatch(pluralized_selectable_row_class.classize(), 
			'remove_row', element);
	}
	this.select_another_row = function(element) {
		MVC.Controller.dispatch(pluralized_selectable_row_class.classize(), 
			'select_another_row', element);
	}
}

MVC.$E.elements_match = function(el1, el2) {
	return (el1.offsetLeft == el2.offsetLeft && el1.offsetTop == el2.offsetTop);
}

MVC.$E.has_class = function(el, class_name) {
	if(el.className && el.className.match(new RegExp(class_name)))
		return true;
	return false;
}

MVC.$E.toggle_class = function(el, class_name){
	if (!el.className) {
		el.className = class_name;
		return;
	}
	if(MVC.$E.has_class(el, class_name)){
		el.className = el.className.replace(new RegExp(class_name, 'g'), '');
		return;
	} else {
		el.className += ' '+class_name;
		return;
	}
}

MVC.$E.previous_sibling_in_class = function(el, class_name){
	var els = MVC.Query('.'+class_name);
	if(els.length == 0 || 
		(els.length == 1 && MVC.$E.elements_match(els[0], el)) ||
		(MVC.$E.elements_match(els[0], el)))
			return null;
	var prev_el = els[0];
	for(var i=1; i<els.length; i++){
		if(MVC.$E.elements_match(els[i], el))
			return prev_el;
		var prev_el = els[i];
	}
	return prev_el;
}

MVC.$E.next_sibling_in_class = function(el, class_name){
	var els = MVC.Query('.'+class_name);
	if(els.length == 0 || 
		(els.length == 1 && MVC.$E.elements_match(els[0], el)) ||
		(MVC.$E.elements_match(els[els.length-1], el)))
			return null;
	var next_el = els[els.length-1];
	for(var i=els.length-2; i>-1; i--){
		if(MVC.$E.elements_match(els[i], el))
			return next_el;
		var next_el = els[i];
	}
	return next_el;
}