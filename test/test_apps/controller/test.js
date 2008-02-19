
Controller('main',{
	load : function(){
		alert('loaded')
	}
});


Controller('things',{
	mouseover : function(params){
		params.element.style.backgroundColor = 'Green'
	},
	mouseout : function(params){
		params.element.style.backgroundColor = 'Red'
	}/*,
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