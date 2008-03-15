ApplicationError.config({prompt_user: false});

breakme3 = function(){
	try {
		br.reak();
	} catch(e) {
		ApplicationError.notify(e);
	}
}