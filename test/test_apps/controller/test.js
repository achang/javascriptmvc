$MVC.Controller('main',{
	load : function(){
		success('load')
	}
});
$MVC.Controller('tests',{
	mouseover : function(params){
		success('mouseover')
	},
	mouseout : function(params){
		success('mouseout')
	},
	click : function(params){
		success('click')
	},
	focus : function(){
		success('focus')
	},
	blur : function(){
		success('blur')
	},
	'# submit' :function(params){
		success('submit')
		params.event.kill();
	}
});