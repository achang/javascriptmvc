(function(){
	var c = $MVC.Controller;
	
	$MVC.Controller = function(model, actions){
		c(model, actions);
		//alert($MVC.application_root)
		var path = ($MVC.application_root ? $MVC.application_root+'/' : '')+'test/functional/'+model+'_controller_test.js';
		var exists = include.checkExists(path);
		if(exists)
			$MVC.Console.log('Loading: "test/functional/'+model+'_controller_test.js"');
		else {
			$MVC.Console.log('Test Controller not found at "test/functional/'+model+'_controller_test.js"');
			return;
		}
		var p = include.get_path();
		include.set_path($MVC.application_root);
		include('test/functional/'+ model+'_controller_test.js');
		include.set_path(p);
	};
	$MVC.Object.extend($MVC.Controller, c);
	
})();
