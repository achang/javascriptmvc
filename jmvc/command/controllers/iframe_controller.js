MVC.Appcreator = {
	select: function(app_name) {
		// select a project
		var uls = document.getElementsByTagName('li');
		for(var i=0; i<uls.length; i++){
			if (uls[i].innerHTML == app_name) {
				uls[i].className += ' selected';
				continue;
			}
			if(uls[i].className.match(/project/) || uls[i].id == 'new_app')
				uls[i].className = uls[i].className.replace(/selected/, '');
		}
		MVC.current_application = app_name;
		MVC.Appcreator.Iframe.load_iframe(this.application_name);
	}
};
MVC.Appcreator.Iframe = {
	load_iframe : function(app_name){
        frames['demo_iframe'].document.location.href = "command/empty.html?"+app_name;
        document.getElementById('demo_iframe').addEventListener('load', this.loadController, true);
	},
	loadController: function(params){
	    // need all the files in each folder
	    var files = {
	        controllers: MVC.Appcreator.Iframe.get_controllers(),
	        models: Mozilla.getFileNames(MVC.file_base.replace(/\//g, Mozilla.slash) + Mozilla.slash+"models"),
	        resources: Mozilla.getFileNames(MVC.file_base.replace(/\//g, Mozilla.slash) + Mozilla.slash+"resources"),
	        views: MVC.Appcreator.Iframe.get_views(),
	        functional_tests: MVC.Appcreator.Iframe.get_functional_tests(),
	        unit_tests: MVC.Appcreator.Iframe.get_unit_tests(),
	        plugins: Mozilla.getDirectoryAndFileNames(MVC.file_base.replace(/\//g, Mozilla.slash) + Mozilla.slash+"jmvc"+Mozilla.slash+"plugins")
	    }
		
		var view_dirs = [];
		for(var i=0; i<files.views.length; i++){
			var dir = files.views[i].split('/')[0];
			if(view_dirs.indexOf(dir) == -1)
				view_dirs.push(dir);
		}
		
	    
	    var res = new MVC.View({
	        absolute_url: 'command/views/results.ejs'
	    }).render({
	        files: files,
	        included: frames['demo_iframe'].MVC.Included,
	        app_name: frames['demo_iframe'].MVC.app_name,
			view_dirs: view_dirs,
	        // get the list of plugins being included from the app file (the rest are dependencies)
	        plugins_in_app_file: MVC.Appcreator.Iframe.plugins_from_app_file(frames['demo_iframe'].MVC.app_name)
	    });
	    document.getElementById('content').innerHTML = res;
	},
	get_controllers: function(){
	    var controller_names = Mozilla.getFileNames(MVC.file_base.replace(/\//g, Mozilla.slash) + Mozilla.slash+"controllers");
	    for (var i = 0; i < controller_names.length; i++) {
	        controller_names[i] = controller_names[i].replace(/_controller/, '');
	    }
	    return controller_names;
	},
	get_unit_tests: function(){
	    var tests = Mozilla.getFileNames(MVC.file_base.replace(/\//g, Mozilla.slash) + Mozilla.slash+"test"+Mozilla.slash+"unit");
	    for (var i = 0; i < tests.length; i++) {
	        tests[i] = tests[i].replace(/_test/, '');
	    }
	    return tests;
	},
	get_functional_tests: function(){
	    var tests = Mozilla.getFileNames(MVC.file_base.replace(/\//g, Mozilla.slash) + Mozilla.slash+"test"+Mozilla.slash+"functional");
	    for (var i = 0; i < tests.length; i++) {
	        tests[i] = tests[i].replace(/_test/, '');
	    }
	    return tests;
	},
	// Mozilla.getRecursiveFileNames()
	// for now, 2nd level folders only
	get_views: function(){
	    var views = [];
	    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	    var dirs = Mozilla.getFiles(MVC.file_base.replace(/\//g, Mozilla.slash) + Mozilla.slash+"views");
	    for (var i = 0; i < dirs.length; i++) {
	        var dir = dirs[i];
	        if (dir.isDirectory() && dir.leafName.indexOf('.') != 0) {
				var files = Mozilla.getDirectoryAndFileNames(MVC.file_base.replace(/\//g, Mozilla.slash) + Mozilla.slash+"views"+Mozilla.slash + dir.leafName);
				for(var j=0;j<files.length; j++){
					views.push(dir.leafName+'/'+files[j])
				}
			}
	    }
	    return views;
	},
	plugins_from_app_file: function(){
	    var file = Mozilla.readFile(MVC.file_base.replace(/\//g, Mozilla.slash) + Mozilla.slash+"apps"+Mozilla.slash + frames['demo_iframe'].MVC.app_name + ".js");
	    var list = MVC.Path.list_of_items('plugins', file);
	    return list;
	}
}