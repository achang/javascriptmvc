
find_and_run = function(t,s){
	opener.focus();	
	var t = opener.$MVC.Tests[t]
	if(s) t.run_test(s);
	else t.run();
};
run_helper = function(t, h){
	opener.focus();	
	var t = opener.$MVC.Tests[t]
	t.run_helper(h);
}

update = function(controller, test_name, assertions){
	var step = document.getElementById('step_'+controller.name+'_'+test_name);
	var result = step.childNodes[1];
	
	if(assertions.failures == 0 && assertions.errors == 0){
		step.className = 'passed'
		result.innerHTML = 'Passed: '+assertions.assertions+' assertion'+add_s(assertions.assertions)
		
	}else{
		step.className = 'failure'
		result.innerHTML = 'Failed: '+assertions.assertions+' assertion'+add_s(assertions.assertions)+
		', '+assertions.failures+' failure'+add_s(assertions.failures)+
		', '+assertions.errors+' error'+add_s(assertions.errors)+' <br/>'+
			assertions.messages.join("<br/>")
	}
};

update_test = function(test){
	var el = document.getElementById(test.name+"_results")
	el.innerHTML = '('+test.passes+'/'+test.test_names.length+ ')'
};


add_s = function(array){
	return array == 1 ? '' : 's'
};

running = function(controller, test_name){
	var step = document.getElementById('step_'+controller.name+'_'+test_name);
	step.className = '';
	var result = step.childNodes[1];
	result.innerHTML = 'Running ...'
};

show = function(type){
	var types = ['unit','functional','application'];
	var els = {}
	var buttons = {};
	for(var i = 0 ; i < types.length; i++){
		els[types[i]] =  document.getElementById(types[i]);
		buttons[types[i]] =  document.getElementById(types[i]+'_button');
		els[types[i]].style.display = 'none'
		buttons[types[i]].className = '';
	}
	els[type].style.display = 'block';
	buttons[type].className = 'selected';

};

