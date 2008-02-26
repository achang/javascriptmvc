include.plugins('helpers');
if(typeof jQuery != 'undefined'){
	include('jquery_ajax')	
}else if( (typeof Ajax == 'undefined') || (typeof Ajax.Request == 'undefined' ) ){
	include('ajax');
}
	