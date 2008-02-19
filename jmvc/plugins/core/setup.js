//I want this to include the standard set on its own ...
include('../helpers/setup', 
		'../inflector/inflector'
		);
if(typeof Prototype == 'undefined') {
	include("../event/standard");
	include("../ajax/ajax");
}

if(typeof Prototype != 'undefined') {
	$$.descendant = function(element, selector) {
		return element.getElementsBySelector(selector);
	};
}else
 	include("../query/standard");

include('../file/setup',
		'../view/view',
		'../view/helpers', 
		'../controller2/controller',
		'../controller_view/controller_view',
		'../includer/includer');