$MVC.Ajax = {};
$MVC.Ajax.Request = function(url,options){
	if(include.get_env() == 'test'){
		url = $MVC.application_root+'/test/fixtures/ajax/' +$MVC.Ajax.test_routes[url];
		options.method = 'get';
	}
	return new Ajax.Request(url,options)
}