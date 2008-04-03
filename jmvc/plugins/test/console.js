//no longer used	
$MVC.Console.log = function(message, html){
	var el = $MVC.TestWindow.document.createElement(html ? 'p' : 'pre' );
	
	el.innerHTML = html ? message : message.toString().replace(/</g,'&lt;');
	
	var place = $MVC.TestWindow.document.getElementById('console_log')
	
	place.appendChild(el);
	if($MVC.TestWindow.window_resise){
		$MVC.TestWindow.window_resise();
		$MVC.TestWindow.console_scroll();
	}
	
	if(typeof console != 'undefined'){
		console.log(message)
	}
	
	
};
