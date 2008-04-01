/* -------------
	Helpers defines the following:

	Object
	* extend
	* to_query_string
	
	
	String
	* capitalize
	* include
	* ends_with
	* camelize
	
	Array
	* include
	* from
	
	Function
	* bind
 ------------  */

if(typeof Prototype != 'undefined'){
	include({path: 'prototype_helpers.js', shrink_variables: false});
}else if(typeof jQuery != 'undefined'){
	include({path: 'jquery_helpers.js', shrink_variables: false});
}else{
	include({path: 'standard_helpers.js', shrink_variables: false});
}
	
