if(typeof Prototype == 'undefined') {
	include("../helpers/standard_helpers",
			"../inflector/inflector",
			"../event/standard",
			"../ajax/ajax");
}else{
	$MVC.Event = Event;
	include("../helpers/prototype_helpers",
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

include('../file/setup',
		'../view/view',
		'../view/helpers', 
		'../controller/controller',
		'../controller_view/controller_view',
		'../includer/includer');