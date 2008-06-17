
if(typeof Prototype == 'undefined') {
	include({path: '../helpers/standard_helpers.js', shrink_variables: false},
			"../inflector/inflector",
			"../event/standard",
			"../ajax/ajax",
			"../class/setup");
	MVC.Included.plugins.push('helpers','inflector','ajax','event','class');
}else{
	MVC.Event = Event;
	include({path: '../helpers/prototype_helpers.js', shrink_variables: false},
			"../inflector/inflector",
			"../ajax/prototype_ajax");
	MVC.Included.plugins.push('helpers','inflector','ajax');
}
//include('../ajax/debug');

if(include.get_env() == 'test') include('test')

MVC.Included.plugins.push('view','controller','controller_view');

include('../view/view', 
		'../controller/controller',
		'../controller/delegator',
		'../controller_view/controller_view');

MVC.Included.plugins.push('view','controller','controller_view');
	
    
include.plugins('element', 'controller_scaffold','model_view_helper','view_helpers')
    
if(include.get_env() == 'development')	include('../view/fulljslint');



