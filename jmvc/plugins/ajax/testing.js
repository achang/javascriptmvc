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
			if($MVC.Console)
				$MVC.Console.log('Loading '+$MVC.root.join('test/fixtures/'+left+right+'.fix'))
		}
		if(include.get_env() == 'test' && (options.use_fixture == null || options.use_fixture == true)){
			url = $MVC.root.join('test/fixtures/'+left+encodeURIComponent( right)+'.fix')
			options.method = 'get';
		}
		return new request(url,options)
	};
	$MVC.Object.extend($MVC.Ajax.Request, request)
	
	if(!$MVC._no_conflict) Ajax.Request = $MVC.Ajax.Request;
})();