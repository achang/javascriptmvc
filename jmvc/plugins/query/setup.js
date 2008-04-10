/**
 * Query describes 2 functions
 * 	$$
 * 	$$.descendant
 */
if(typeof Prototype != 'undefined') {
	MVC.CSSQuery = $$;
	MVC.CSSQuery.descendant = function(element, selector) {
		return element.getElementsBySelector(selector);
	};
}else
 	include("standard");