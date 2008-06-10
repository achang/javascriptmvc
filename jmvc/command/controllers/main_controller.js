MainController = MVC.Controller.extend('main',{
    load: function(params){
	    MVC.file_base = Mozilla.getCurrentPath();
	    var files = Mozilla.getFileNames(MVC.file_base.replace(/\//g, "\\") + "\\apps");
	    var txt = '';
	    for (var f = 0; f < files.length; f++) {
	        var name = files[f];
	        if (name.indexOf('_production') == -1 && name.indexOf('_test') == -1) 
	            txt += '<li class="project">' + name + '</li>';
	    }
	    txt += '<li id="new_app">Create New Application + </li>';
	    document.getElementById('projects').innerHTML = txt;
    }
});