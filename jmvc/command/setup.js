function load_frame(app_name){
	document.getElementById('render_to').innerHTML = "";
	frames['demo_iframe'].document.location.href = "command/empty.html?"+app_name;
	document.getElementById('demo_iframe').addEventListener('load', print_results, true);
}

function get_controllers(){
	var controller_names = mozillaGetFileNames(MVC.file_base.replace(/\//g,"\\")+"\\controllers");
	for(var i=0; i<controller_names.length; i++) {
		controller_names[i] = controller_names[i].replace(/_controller/,'');
	}
	return controller_names;
}
function get_unit_tests(){
	var tests = mozillaGetFileNames(MVC.file_base.replace(/\//g,"\\")+"\\test\\unit");
	for(var i=0; i<tests.length; i++) {
		tests[i] = tests[i].replace(/_test/,'');
	}
	return tests;
}
function get_functional_tests(){
	var tests = mozillaGetFileNames(MVC.file_base.replace(/\//g,"\\")+"\\test\\functional");
	for(var i=0; i<tests.length; i++) {
		tests[i] = tests[i].replace(/_test/,'');
	}
	return tests;
}

function get_views(){
	var views = {};
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    var dirs = mozillaGetFiles(MVC.file_base.replace(/\//g,"\\")+"\\views");
    for(var i = 0; i < dirs.length; i++){
		var dir = dirs[i];
		if(dir.isDirectory() && dir.leafName.indexOf('.') != 0)
			views[dir.leafName] = mozillaGetFileNames(MVC.file_base.replace(/\//g,"\\")+"\\views\\"+dir.leafName);
    }
	return views;
}

function print_results(){
	// need all the files in each folder
	var files = {
		controllers: get_controllers(),
		models: mozillaGetFileNames(MVC.file_base.replace(/\//g,"\\")+"\\models"),
		resources: mozillaGetFileNames(MVC.file_base.replace(/\//g,"\\")+"\\resources"),
		views: get_views(),
		functional_tests: get_functional_tests(),
		unit_tests: get_unit_tests(),
		plugins: mozillaGetFileNames(MVC.file_base.replace(/\//g,"\\")+"\\jmvc\\plugins")
	}
	
	var res = new MVC.View({absolute_url: 'command/views/results.ejs'}).render({
		files: files,
		included: frames['demo_iframe'].MVC.Included,
		app_name: frames['demo_iframe'].MVC.app_name
	});
	document.getElementById('render_to').innerHTML = res;
}

loading = function(){
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    var ds =  Components.classes["@mozilla.org/file/directory_service;1"];
    var ss = ds.getService(Components.interfaces.nsIDirectoryServiceProvider);
    var cwd = ss.getFile("CurWorkD",{})
    var convert = cwd.path.indexOf("\\") != -1;
    
    var base = window.location.pathname.match(/\/(.*)\/jmvc\/command.html/)[1];
    
    if(convert){
        base = base.replace(/\//g,"\\")
    }
    MVC.file_base = base;
	var files = mozillaGetFileNames(base.replace(/\//g,"\\")+"\\apps");
    var txt = '';
    for(var f = 0; f < files.length; f++){
        var name = files[f];
        if(name.indexOf('_production') == -1 && name.indexOf('_test') == -1  )
            txt += '<li class="project">'+name+'</li>';
    }
	txt += '<li id="new_app">Create New Application + </li>';
    document.getElementById('projects').innerHTML = txt;
    
}

mozillaChooseFile = function(filePath){
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker)

    fp.init(window, "", fp.modeSave);
    fp.defaultExtension = "html";
    fp.defaultString = "index.html";
    fp.appendFilters(fp.filterHTML);
    fp.appendFilters(fp.filterAll);
	
	var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(MVC.file_base);
	fp.displayDirectory = file;
	
	var rv = fp.show();
	if (rv == fp.returnOK || rv == fp.returnReplace) {
	  var file = fp.file;
	  var path = fp.file.path;
	}
	return path
}

function mozillaSaveFile(filePath,content)
{
	if(window.Components) {

			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var file = Components.classes["@mozilla.org/file/local;1"]
								.createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filePath);
			if(!file.exists())
				file.create(0,0664);
			var out = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			out.init(file,0x20|0x02,00004,null);
			out.write(content,content.length);
			out.flush();
			out.close();
			return true;

	}
	return null;
}
mozillaCreateDirectory = function(path) {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var file = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(path);
	
	if( !file.exists() || !file.isDirectory() )
	   file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
}
mozillaGetFileNames = function(filePath){
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    var files = mozillaGetFiles(filePath);
    var file_names = [];
    for(var f = 0; f < files.length; f++){
        var file = files[f];
        var name = file.path.match(/[^\/\\]*$/)[0].split('.')[0];
        if(name != '' && name.indexOf('.') != 0)
            file_names.push(name);
    }
	return file_names;
}
mozillaGetFiles = function(filePath){
    var paths = [];
    
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(filePath);
    var entries = file.directoryEntries;
    while(entries.hasMoreElements())
    {
      var entry = entries.getNext();
      entry.QueryInterface(Components.interfaces.nsIFile);
      paths.push(entry);
    }
    return paths;
}
mozillaReadFile = function(filePath){
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	var file = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(filePath);
	var data = "";
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
	                        .createInstance(Components.interfaces.nsIFileInputStream);
	var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
	                        .createInstance(Components.interfaces.nsIScriptableInputStream);
	fstream.init(file, -1, 0, 0);
	sstream.init(fstream); 
	
	var str = sstream.read(4096);
	while (str.length > 0) {
	  data += str;
	  str = sstream.read(4096);
	}
	
	sstream.close();
	fstream.close();
	return data;
}
