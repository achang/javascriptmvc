(function(){
	var request = Ajax.Request;
	$MVC.Ajax = {}
	$MVC.Object.extend($MVC.Ajax, Ajax);
	$MVC.Ajax.Request = function(url,options){
		if( ! options.no_test  ){
			$MVC.Console.log('Loading '+$MVC.application_root+'test/fixtures/ajax/'+url.replace(/\?|#|&/g,'-').replace(/\//g,'_').replace('=','-')+'.fix' )
		}
		if(include.get_env() == 'test' && !options.no_test){
			url = $MVC.application_root+'test/fixtures/ajax/'+ encodeURIComponent( url.replace(/\?|#|&/g,'-').replace(/\//g,'_').replace('=','-'))+'.fix';
			options.method = 'get';
		}
		return new request(url,options)
	};
	$MVC.Object.extend($MVC.Ajax.Request, request)
	Ajax.Request = $MVC.Ajax.Request;
})();
