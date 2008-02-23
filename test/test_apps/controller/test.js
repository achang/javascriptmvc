Controller('main',{
	load : function(){
		success('load')
	}
});
Controller('tests',{
	mouseover : function(params){
		log('mouseover')
		success('mouseover')
	},
	mouseout : function(params){
		log('mouseout')
		success('mouseout')
	},
	click : function(params){
		log('click')
		success('click')
	},
	focus : function(){
		log('focused')
		success('focus')
	},
	blur : function(){
		log('blured')
		success('blur')
	},
	'# submit' :function(params){
		log('submit')
		success('submit')
		params.event.stop();
	}
});