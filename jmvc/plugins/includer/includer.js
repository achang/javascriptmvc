// JMVC request
include.controllers = function(){
	for(var i=0; i< arguments.length; i++){
		arguments[i] = 'controllers/'+arguments[i]+'_controller';
	}
	return include.apply(null, arguments);
};
include.models = function(){
	for(var i=0; i< arguments.length; i++){
		arguments[i] = 'models/'+arguments[i];
	}
	return include.apply(null, arguments);
};
include.resources = function(){
	for(var i=0; i< arguments.length; i++){
		arguments[i] = 'resources/'+arguments[i];
	}
	return include.apply(null, arguments);
};

