include.plugins('ajax');
include('view','helpers');
if(include.get_env() == 'development')	include('fulljslint');