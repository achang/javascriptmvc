include.plugins('helpers');
if(typeof jQuery != 'undefined'){
	include('jquery_ajax')	
}else if( typeof Prototype != 'undefined' ){
	$MVC.Ajax = Ajax;
}else{
	include('ajax')
}
	