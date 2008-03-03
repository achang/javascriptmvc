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

window.onerror = $MVC.error_handler;