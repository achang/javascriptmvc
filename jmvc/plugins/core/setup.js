if(typeof Prototype == 'undefined') {
	include({path: '../helpers/standard_helpers.js', shrink_variables: false},
			"../inflector/inflector",
			"../event/standard",
			"../ajax/ajax");
}else{
	$MVC.Event = Event;
	include({path: '../helpers/prototype_helpers.js', shrink_variables: false},
			"../inflector/inflector",
			"../ajax/prototype_ajax");
}
if(include.get_env() == 'test')
	include('../ajax/testing');
	
/*if(typeof Prototype != 'undefined') {
	$MVC.CSSQuery = $$;
	$MVC.CSSQuery.descendant = function(element, selector) {
		return element.getElementsBySelector(selector);
	};
}else
 	include("../query/standard");*/

include('../view/view',
		'../view/helpers', 
		'../controller/controller',
		'../controller_view/controller_view',
		'../includer/includer');
		
if(include.get_env() == 'development')	include('../view/fulljslint');