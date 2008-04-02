	
$MVC.Console.log = function(message){
	var p =$MVC.Test.window.document.createElement('p');
	p.innerHTML = message;
	
	var place = $MVC.Test.window.document.getElementById('console_log')
	
	place.appendChild(p);
	if($MVC.Test.window.window_resise){
		$MVC.Test.window.window_resise();
		$MVC.Test.window.console_scroll();
	}
	
	if(typeof console != 'undefined'){
		console.log(message)
	}
	
	
};
