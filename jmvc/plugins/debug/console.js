if(include.get_env() != 'test' && typeof console != 'undefined'){
	$MVC.Console.log = function(message){
			console.log(message)
	};
}else{
	
	$MVC.Console = {};
	$MVC.Console.window = window.open($MVC.root+'/plugins/debug/console.html', null, "width=600,height=400,resizable=yes,scrollbars=yes");
	$MVC.Console.log = function(message, html){
		var el = $MVC.Console.window.document.createElement(html ? 'p' : 'pre' );

		el.innerHTML = html ? message : message.toString().replace(/</g,'&lt;');
		var place = $MVC.Console.window.document.getElementById('console_log')
		place.appendChild(el);
		
		if($MVC.Console.window.window_resise){
			$MVC.Console.window.window_resise();
			$MVC.Console.window.console_scroll();
		}
		
		if(typeof console != 'undefined'){
			console.log(message)
		}
	};
}

setTimeout(function(){
	$MVC.Console.log('You are running '+
		($MVC.script_options&&$MVC.script_options[0] ? '"'+$MVC.script_options[0]+'" ' : '') +'in the '+include.get_env()+' environment.')
},1)




