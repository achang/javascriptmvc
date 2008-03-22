add_test = function(test){
	var t = document.createElement('div')
	var txt = '<a href="javascript: void(0);" onclick="'+test.toString()+'();">'+test.toString()+'</a>';
	txt+= '<p>Tested</p><ol>';
	for(var a = 0 ; a < test.actions.length; a ++ ){
		txt+= test.actions[a].toHTML();
	}
	txt+= '</ol><p>Untested</p><ol>'
	for(var a = 0 ; a < test.untested.length; a ++ ){
		txt+= test.untested[a].toHTML();
	}
	t.innerHTML  = txt+ '</ol>'
	document.body.appendChild(t);
}