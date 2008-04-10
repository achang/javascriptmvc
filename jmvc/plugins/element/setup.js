if(typeof Prototype != 'undefined'){
	MVC.$E = $;
	MVC.$E.insert = Element.insert;
}else if(typeof jQuery != 'undefined'){
	include('jquery_element');
}else
	include('element');