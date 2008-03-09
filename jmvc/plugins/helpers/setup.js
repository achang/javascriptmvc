
if(typeof Prototype != 'undefined'){
	include('prototype_helpers')
}else if(typeof jQuery != 'undefined'){
	include('jquery_helpers')
}else{
	include('standard_helpers')
}