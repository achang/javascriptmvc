//I want this to include the standard set on its own ...
include('../helpers/setup', 
		'../inflector/inflector'
		);
	
if(typeof Prototype == 'undefined') {
	include("../event/standard");
	include("../ajax/ajax");
}else{
	$MVC.Event = Event;
	include("../ajax/prototype_ajax");
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

include('../file/setup',
		'../view/view',
		'../view/helpers', 
		'../controller/controller',
		'../controller_view/controller_view',
		'../includer/includer');