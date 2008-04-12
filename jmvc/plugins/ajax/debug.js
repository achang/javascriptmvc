(function(){
	var request = MVC.Ajax;

	MVC.Ajax = function(url,options){
		if( options.use_fixture == null || options.use_fixture == true  ){
			var match = url.match(/^(?:https?:\/\/[^\/]*)?\/?([^\?]*)\??(.*)?/);
			var left = match[1];
			
			var right = options.method ? '.'+options.method.toLowerCase() : '.post';
			if(match[2]){
				left += '/';
				right = match[2].replace(/\#|&/g,'-').replace(/\//g, '~')+right;
			}
			right = right+MVC.Ajax.add_url(left+right);
			if(include.get_env() != 'test')
			MVC.Console.log('Requesting "'+url+'".  As a fixture it would be:\n    "test/fixtures/'+left+right);
		}
		
		if(include.get_env() == 'test' && (options.use_fixture == null || options.use_fixture == true)){
			MVC.Console.log('Loading "test/fixtures/'+left+right+'" for\n        "'+url+'"' );
			url = MVC.root.join('test/fixtures/'+left+encodeURIComponent( right));
			options.method = 'get';
		}
		var req =  new request(url,options);

		return req;
	};
	MVC.Object.extend(MVC.Ajax, request);
	
	if(!MVC._no_conflict && typeof Prototype == 'undefined') Ajax = MVC.Ajax;
	
	MVC.Ajax.urls = {};
	
	MVC.Ajax.add_url = function(url){
		if(!  MVC.Ajax.urls[url] ){
			MVC.Ajax.urls[url] = 1;
			return '';
		}
		return '.'+(++MVC.Ajax.urls[url]);
	};
})();