include.plugins('helpers','inflector','event','class2');
include('delegator','controller');
if(MVC.View) include.plugins('controller_view');
//if(include.get_env() == 'test') include('test')