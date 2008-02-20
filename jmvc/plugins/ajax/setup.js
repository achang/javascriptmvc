include.plugins('helpers')
if( (typeof Ajax == 'undefined') || (typeof Ajax.Request == 'undefined' ) ){
	include('ajax');
}
	