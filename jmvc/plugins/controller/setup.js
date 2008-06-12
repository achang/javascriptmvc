include.plugins('helpers','inflector','event','class');
include('delegator','controller');
if(MVC.View) include.plugins('controller_view');
//if(include.get_env() == 'test') include('test')