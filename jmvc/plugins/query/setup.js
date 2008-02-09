/**
 * Query describes 2 functions
 * 	$$
 * 	$$.descendant
 */
if(typeof Prototype != 'undefined') {
	$$.descendant = function(element, selector) {
		return element.getElementsBySelector(selector);
	};
}else
 	include("standard");