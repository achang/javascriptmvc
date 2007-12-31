TestController  = Class.create(JMVC.Controller, {
	start : function(params){
		TEST.action_run = true
		this.instance_variable = 'instance variable'
		
	},
	another_function : function(){}
})