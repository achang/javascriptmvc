(function(){
	var c = $MVC.Controller;
	
	$MVC.Controller = function(model, actions){
		c(model, actions);
		
		var p = include.get_path();
		include.set_path()
		include.set_path($MVC.application_root);
		include('test/functional/'+ model+'_controller_test.js');
		include.set_path(p);
	};
	$MVC.Object.extend($MVC.Controller, c);
	
})();
