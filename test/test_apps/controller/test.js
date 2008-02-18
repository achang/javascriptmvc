
Controller('main',{
	load : function(){
		alert('loaded')
	}
});


Controller('things',{
	click : function(params){
		alert('clicked '+params.element.id);
		
	},
	mouseover : function(params){
		params.element.style.backgroundColor = 'Green'
	},
	mouseout : function(params){
		params.element.style.backgroundColor = 'Red'
	}/*,
	'#click' :function(params){
		params.element.style.backgroundColor = 'Blue'
	}*/,
	'input focus' :function(params){
		alert('focus')
	}
});