Errors = [];
assertEqual = function(expected, actual){
	if(expected !== actual){
		Errors.push( 'Expected is not equal to actual: '+expected.toString()+' !== '+actual.toString() ) ;
	}
}
Tests = {
	extend : function(){
		var extend = {};
		Object.extend(extend, {test: 'here'})
		assertEqual('here', extend.test)
	},
	select : function(){
		assertEqual('loading', $E('main').innerHTML)
	},
	capitalize : function(){
		assertEqual('Loading', 'loading'.capitalize());
	},
	uncapitalize : function(){
		assertEqual('loading', 'Loading'.uncapitalize());
	},
	chomp : function(){
		assertEqual('Load', 'Loading'.chomp('ing'));
	}
}

for(test_name in Tests){
	if(Tests.hasOwnProperty(test_name))
	{
		try{
			Tests[test_name]();
		}catch(e){
			Errors.push( 'Error in '+test_name+': '+e ) ;
		}
	}
}

document.getElementById('main').innerHTML = Errors.join('<br/>')