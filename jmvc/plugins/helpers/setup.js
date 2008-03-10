
if(typeof Prototype != 'undefined'){
	include({path: 'prototype_helpers.js', shrink_variables: false});
}else if(typeof jQuery != 'undefined'){
	include({path: 'jquery_helpers.js', shrink_variables: false});
}else{
	include({path: 'standard_helpers.js', shrink_variables: false});
}
	
