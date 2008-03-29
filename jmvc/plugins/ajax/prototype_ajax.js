(function(){
	var request = Ajax.Request;
	$MVC.Ajax = {}
	$MVC.Object.extend($MVC.Ajax, Ajax);
	$MVC.Ajax.Request = function(url,options){
		if( ! options.no_test  ){
			var match = url.match(/^\/([^\?]*)\??(.*)?/)
			var left = match[1];
			var right = '';
			if(match[2]){
				left += '/';
				right = match[2].replace(/\#|&/g,'-').replace(/\//g, '~')
			}
			$MVC.Console.log('Loading '+$MVC.application_root+'/test/fixtures/ajax/'+left+right+'.fix' )
		}
		if(include.get_env() == 'test' && !options.no_test){
			url = $MVC.application_root+'/test/fixtures/ajax/'+left+encodeURIComponent( right)+'.fix';
			options.method = 'get';
		}
		return new request(url,options)
	};
	$MVC.Object.extend($MVC.Ajax.Request, request)
	Ajax.Request = $MVC.Ajax.Request;
})();
