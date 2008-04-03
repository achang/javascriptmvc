(function(){
	var request = $MVC.Ajax.Request;

	$MVC.Ajax.Request = function(url,options){
		if( options.use_fixture == null || options.use_fixture == true  ){
			var match = url.match(/^\/?([^\?]*)\??(.*)?/)
			var left = match[1];
			var right = '';
			if(match[2]){
				left += '/';
				right = match[2].replace(/\#|&/g,'-').replace(/\//g, '~');
			}
			if(include.get_env() != 'test')
			$MVC.Console.log('Requesting "'+url+'".  As a fixture it would be:\n    "test/fixtures/'+left+right+'.fix"')
		}
		
		if(include.get_env() == 'test' && (options.use_fixture == null || options.use_fixture == true)){
			$MVC.Console.log('Loading "test/fixtures/'+left+right+'.fix" for\n        "'+url+'"' )
			url = $MVC.root.join('test/fixtures/'+left+encodeURIComponent( right)+'.fix')
			options.method = 'get';
		}
		var req =  new request(url,options);
		
		
		
		return req;
	};
	$MVC.Object.extend($MVC.Ajax.Request, request)
	
	if(!$MVC._no_conflict) Ajax.Request = $MVC.Ajax.Request;
})();