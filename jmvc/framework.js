//set path back to application root and load the user initialize function.
include.set_path($MVC.get_application_root());
$MVC.user_initialize_function();