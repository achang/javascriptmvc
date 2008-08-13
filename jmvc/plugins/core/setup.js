
if(typeof Prototype == 'undefined') {
	include({path: '../lang/standard_helpers.js', shrink_variables: false},
			"../lang/inflector/inflector",
			"../dom/event/standard",
			"../io/ajax/ajax",
			"../lang/class/setup");
	MVC.Included.plugins.push('lang','lang/inflector','io/ajax','dom/event','lang/class');
}else{
	MVC.Event = Event;
	include({path: '../lang/prototype_helpers.js', shrink_variables: false},
			"../lang/inflector/inflector",
			"../io/ajax/prototype_ajax");
	MVC.Included.plugins.push('lang','lang/inflector','io/ajax');
}
//include('../ajax/debug');

if(include.get_env() == 'test') include('test')

MVC.Included.plugins.push('view','controller','controller/view');

include('../view/view', 
		'../controller/controller',
		'../controller/delegator',
		'../controller/view/controller_view');

MVC.Included.plugins.push('view','controller','controller/view');
	
    
include.plugins('element', 'controller_scaffold','model_view_helper','view_helpers')
    
if(include.get_env() == 'development')	include('../view/fulljslint');



