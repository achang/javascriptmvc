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


Controller('others',{
	
	/*mouseover : function(params){
		params.element.style.backgroundColor = 'Green'
	},
	mouseout : function(params){
		params.element.style.backgroundColor = 'Red'
	},
	click : function(params){
		alert('clicked '+params.element.id);
		
	},
	'#click' :function(params){
		params.element.style.backgroundColor = 'Blue'
	},
	'input focus' :function(params){
		alert('focus')
	}*/
});