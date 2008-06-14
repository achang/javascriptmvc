Mozilla = {
    chooseFile: function(defaultString){
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker)
        
        fp.init(window, "", fp.modeSave);
        fp.defaultExtension = "html";
        fp.defaultString = defaultString || "index.html";
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
    },
    saveFile: function(filePath, content, overwrite){
        overwrite = overwrite || false;
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filePath);
        if(!overwrite && file.exists()) return false;
        
        if (!file.exists()) 
            file.create(0, 0664);
        var out = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
        out.init(file, 0x20 | 0x02, 00004, null);
        out.write(content, content.length);
        out.flush();
        out.close();
        return true;

    },
    createDirectory: function(path){
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(path);
        
        if (!file.exists() || !file.isDirectory()) 
            file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
    },
    getDirectoryAndFileNames: function(filePath){
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var files = Mozilla.getFiles(filePath);
        var file_names = [];
        for (var f = 0; f < files.length; f++) {
            var file = files[f];
            var name = file.path.match(/[^\/\\]*$/)[0].split('.')[0];
            if (name != '' && name.indexOf('.') != 0) 
                file_names.push(name);
        }
        return file_names;
    },
    getFileNames: function(filePath){
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var files = Mozilla.getFiles(filePath);
        var file_names = [];
        for (var f = 0; f < files.length; f++) {
            var file = files[f];
            var name = file.path.match(/[^\/\\]*$/)[0];
            if (name != '' && name.indexOf('.') != 0 && name.indexOf('.js') != -1) 
                file_names.push(name.split('.')[0]);
        }
        return file_names;
    },
    getFiles: function(filePath){
        var paths = [];
        
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filePath);
        var entries = file.directoryEntries;
        while (entries.hasMoreElements()) {
            var entry = entries.getNext();
            entry.QueryInterface(Components.interfaces.nsIFile);
            paths.push(entry);
        }
        return paths;
    },
    readFile: function(filePath){
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
        file.initWithPath(filePath);
        if(!file.exists()) return null;
        var data = "";
        var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
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
    },
	getCurrentPath: function(){
	    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	    var ds = Components.classes["@mozilla.org/file/directory_service;1"];
	    var ss = ds.getService(Components.interfaces.nsIDirectoryServiceProvider);
	    var cwd = ss.getFile("CurWorkD", {})
	    
	    var convert = cwd.path.indexOf(MVC.Path.slash) != -1;
	    
	    if(MVC.Windows)
	    	var base = window.location.pathname.match(/\/(.*)\/jmvc\/command.html/)[1];
		else
	    	var base = window.location.pathname.match(/(\/.*)\/jmvc\/command.html/)[1];
	    
	    if (convert) {
	        base = base.replace(/\//g, MVC.Path.slash)
	    }
		
		return base;
	}
}