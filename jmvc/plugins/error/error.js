$MVC.RemoteModel('application_error', {url: 'https://damnit.jupiterit.com', name: 'error'},{});

ApplicationError.generate_content = function(params){
	var content = [];
	for(var attr in params){
		if(params.hasOwnProperty(attr)){
			content.push(attr+':\n     '+params[attr]);
		}
	}
	return content.join('\n');
};

$MVC.error_handler = function(msg, url, l){
	var params = {error: {}};
	params.error.subject = 'ApplicationError on: '+window.location.href;
	var error = {
		'Error Message' : msg,
		'File' :  url,
		'Line Number' : l,
		'Browser' : navigator.userAgent,
		'Page' : location.href,
		'HTML Content' : document.documentElement.innerHTML.replace(/\n/g,"\n     ").replace(/\t/g,"     "),
		'Stack' : new Error().stack
	};
	params.error.content = ApplicationError.generate_content(error);
	ApplicationError.create(params);
	return false;
};
if($MVC.Controller){
	$MVC.Controller._dispatch_action = function(instance, action_name, params){
		try{
			return instance[action_name](params);
		}catch(e){
			e['Controller'] = instance.klass.className;
			e['Action'] = action_name;
			e['Browser'] = navigator.userAgent;
			e['Page'] = location.href;
			e['HTML Content'] = document.documentElement.innerHTML.replace(/\n/g,"\n     ").replace(/\t/g,"     ");
			var content = ApplicationError.generate_content(e);
			new ApplicationError({subject: 'Dispatch Error: '+e.toString(), content: content}).save();
		}
	};
}

window.onerror = $MVC.error_handler;