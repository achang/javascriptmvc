add_step = function(name, checked, test_name){
	return '<tr class="step" id="step_'+test_name+'_'+name+'">'+
		"<td class='name'>"+
		"<a href='javascript: void(0);' onclick='find_and_run(\""+test_name+"\",\""+name+"\")'>"+name+'</a></td>'+
		'<td>&nbsp;</td></tr>';
};

add_test = function(test){
	var t = document.createElement('div');
	t.className = 'test'
	t.innerHTML  = test.toHTML();
	t.id = 'test_'+test.name
	var insert_into = document.getElementById(test.type+'_tests');
	insert_into.appendChild(t);
}


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
