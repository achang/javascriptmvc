if(typeof console == 'undefined'){
	//$MVC.Console = window.open($MVC.root+'/plugins/debug/console.html', null, "width=600,height=400,resizable=yes,scrollbars=yes");
	//$MVC.Console.log = function(message){
	//	var p =$MVC.Console.document.createElement('p')
	//	p.innerHTML = message;
	//	$MVC.Console.document.body.appendChild(p)
	//}
}else{
	$MVC.Console.log = function(message){
			console.log(message)
	}
}



