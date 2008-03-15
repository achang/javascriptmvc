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