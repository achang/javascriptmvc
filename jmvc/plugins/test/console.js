	
$MVC.Console.log = function(message, html){
	var el = $MVC.Test.window.document.createElement(html ? 'p' : 'pre' );
	
	el.innerHTML = html ? message : message.toString().replace(/</g,'&lt;');
	
	var place = $MVC.Test.window.document.getElementById('console_log')
	
	place.appendChild(el);
	if($MVC.Test.window.window_resise){
		$MVC.Test.window.window_resise();
		$MVC.Test.window.console_scroll();
	}
	
	if(typeof console != 'undefined'){
		console.log(message)
	}
	
	
};
