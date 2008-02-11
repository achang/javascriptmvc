//I want this to include the standard set on its own ...
include('../helpers/setup', 
		'../inflector/inflector'
		);
if(typeof Prototype == 'undefined') 
	include("../event/standard");

if(typeof Prototype != 'undefined') {
	$$.descendant = function(element, selector) {
		return element.getElementsBySelector(selector);
	};
}else
 	include("../query/standard");

include('../file/setup',
		'../view/ejs',
		'../view/view', 
		'../controller/controller',
		'../controller_view/controller_view',
		'../includer/includer');