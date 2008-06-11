include.plugins('helpers');
include('view');
if(include.get_env() == 'development')	include('fulljslint');

if(MVC.Controller) include.plugins('controller_view');