MainController = MVC.Controller.extend('main',{
    load: function(params){
	    MVC.file_base = Mozilla.getCurrentPath();
	    this.files = Mozilla.getFileNames(MVC.Path.join(MVC.file_base,"apps"));
		
		// reload the project tabs
		var res = new MVC.View({absolute_url: 'command/views/projects.ejs'}).render(this);
	    document.getElementById('projects').innerHTML = res;
		
		if(location.hash)
			MVC.Appcreator.select(location.hash.split('#')[1]);
        else{
            if(this.files.length == 0){
                $E('content').innerHTML = new View({absolute_url: 'command/views/start.ejs'}).render(this);
            }else{
                $E('content').innerHTML = "Please select a project or create a new application."
            }
        }
    }
});
