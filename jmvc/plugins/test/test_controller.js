
find_and_run = function(t,s){
	opener.focus();	
	var t = opener.$MVC.Tests[t]
	if(s) t.run_test(s);
	else t.run();
};


update = function(controller, test_name, assertions){
	var step = document.getElementById('step_'+controller.name+'_'+test_name);
	var result = step.childNodes[1];
	
	if(assertions.failures == 0){
		step.className = 'passed'
		result.innerHTML = 'Passed: '+assertions.assertions+' assertion'+add_s(assertions.assertions)
		
	}else{
		step.className = 'failure'
		result.innerHTML = 'Failed: '+assertions.assertions+' assertion'+add_s(assertions.assertions)+', '+assertions.failures+' failure'+add_s(assertions.failures)+' <br/>'+
			assertions.messages.join("<br/>")
	}
	
}

add_s = function(array){
	return array > 1 ?'s' : ''
}

running = function(controller, test_name){
	var step = document.getElementById('step_'+controller.name+'_'+test_name);
	var result = step.childNodes[1];
	result.innerHTML = 'Running ...'
	
}