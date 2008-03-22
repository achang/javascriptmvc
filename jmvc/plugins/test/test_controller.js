add_step = function(name, checked, id, i){
	return '<tr class="step" id="step_'+id+'_'+i+'"><td><input type="checkbox" '+ (checked? 'checked="checked"' : '')+'/></td>'+
		'<td class="name"  onclick="find_and_run('+id+','+i+')" >'+name+'</td><td>&nbsp;</td></tr>';
};

add_test = function(test){
	var txt = "<h3><img class='min' src='minimize.png'/>   <img src='play.png' onclick='find_and_run("+test.id+")'/> "+test.name+"</h3>";
	txt+= "<table><tr><th style='width: 25px;'></th><th>test</th><th>result</th></tr><tbody>";
	for(var a = 0 ; a < test.steps.length; a ++ ){
		txt+= add_step(test.steps[a], test.steps[a].checked_default,test.id, a);
	}
	txt+= "</tbody></table>";
	
	var t = document.createElement('div');
	t.className = 'test'
	t.innerHTML  = txt;
	t.id = 'test_'+test.id
	var insert_into = document.getElementById(test.type+'_tests');
	insert_into.appendChild(t);
}


find_and_run = function(t,s){
	var t = get_tests()[t];
	if(s) t.run_step(s);
	else t.run();
};


step_checked = function(t,s){
	return $MVC.CSSQuery('#step_'+t+'_'+s+' input')[0].checked
};