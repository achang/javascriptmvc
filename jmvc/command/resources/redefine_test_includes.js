MVC.Included.unit_tests = [];
MVC.Included.functional_tests = [];
include.unit_tests = function(){
	for(var i=0; i < arguments.length; i++) MVC.Included.unit_tests.push(arguments[i].replace(/_test/,''));
}
include.functional_tests = function(){
	for(var i=0; i < arguments.length; i++) MVC.Included.functional_tests.push(arguments[i].replace(/_test/,''));
}