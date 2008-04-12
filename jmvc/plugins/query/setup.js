/**
 * Query describes 2 functions
 * 	$$
 * 	$$.descendant
 */
if(typeof Prototype != 'undefined') {
	MVC.Query = $$;
	MVC.Query.descendant = function(element, selector) {
		return element.getElementsBySelector(selector);
	};
}else
 	include("standard");