function load_frame(app_name){
	document.getElementById('render_to').innerHTML = "";
	frames['demo_iframe'].document.location.href = "command/empty.html?"+app_name;
	document.getElementById('demo_iframe').addEventListener('load', print_results, true);
}

function print_results(){
	var res = new MVC.View({absolute_url: 'command/views/results.ejs'}).render({
		Included: frames['demo_iframe'].MVC.Included,
		app_name: frames['demo_iframe'].MVC.app_name
	});
	document.getElementById('render_to').innerHTML = res;
}

loading = function(){
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    var ds =  Components.classes["@mozilla.org/file/directory_service;1"];
    var ss = ds.getService(Components.interfaces.nsIDirectoryServiceProvider);
    var cwd = ss.getFile("CurWorkD",{})
    var convert = cwd.path.indexOf("\\") != -1 

    //while(cwd.directoryEntries.hasMoreElements()){
    //    var el = cwd.directoryEntries.getNext();
    //    el.QueryInterface(Components.interfaces.nsIFile);
    //    var a = 1;
    //}
    
    var base = window.location.pathname.match(/\/(.*)\/jmvc\/command.html/)[1];
    
    if(convert){
        base = base.replace(/\//g,"\\")
    }
    MVC.file_base = base;
    files = mozillaGetFiles(base.replace(/\//g,"\\")+"\\apps");
    var txt = ''
    for(var f = 0; f < files.length; f++){
        var file = files[f];
        var name = file.path.match(/[^\/\\]*$/)[0].split('.')[0];
        if(name != '' && name.indexOf('.') != 0 && 
			name.indexOf('_production') == -1 && name.indexOf('_test') == -1  )
        {
            txt += '<li class="project">'+name+'</li>';
        }
    }
	txt += '<li id="new_app">Create New Application + </li>';
    document.getElementById('projects').innerHTML = txt
    
}        


function mozillaSaveFile(filePath,content)
{
	if(window.Components) {

			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
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