include.plugins('helpers');
if(typeof jQuery != 'undefined'){
	include('jquery_ajax')	
}else if( typeof Prototype != 'undefined' ){
	include('prototype_ajax')	
	
}else{
	include('ajax')
}

if(MVC.Console)
	include('debug')