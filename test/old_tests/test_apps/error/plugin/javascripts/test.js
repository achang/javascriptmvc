breakme = function(){
	throw 'gone'
}

breakme2 = function(){
	try {
		throw 'destroyed'
	} catch(e) {
		ApplicationError.notify(e);
	}
}

breakme3 = function(){
	try {
		br.reak();
	} catch(e) {
		ApplicationError.notify(e);
	}
}

breakme4 = function(){
	var notification = new ApplicationError({subject: "test", content: 'someone clicked the new widget'});
	notification.save();
}

$MVC.Controller('todo', {
	click: function(params) {
		brea.eak();
	}
});
alert('reloaded');