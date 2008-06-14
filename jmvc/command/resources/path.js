MVC.File.prototype.path_to_file = function(path_to){
    var file2 = new MVC.File(path_to.replace(/\\/g, "/"));
    var file1_path = this.path.replace(/\\/g, "/");
    var file1_path_arr = file1_path.split("/");
    var file1 = file1_path_arr.slice(0, file1_path_arr.length - 1).join("/");
    var final_path = file2.to_reference_from_same_domain(file1);
    return final_path;
}

MVC.Path = {
	add_include: function(include_type, file, file_to_add){
	    return this.modify_includes(include_type, file, file_to_add, true);
	},
	remove_include: function(include_type, file, file_to_remove){
	    return this.modify_includes(include_type, file, file_to_remove, false);
	},
	add_to_include_file: function(include_type, file){
		if(include_type == 'resources' || include_type == 'plugins' || 
		include_type == 'unit_tests' || include_type == 'functional_tests')
			return ("include."+include_type+"();\n"+file);
		else if(include_type == 'views' || include_type == 'controllers' || include_type == 'models'){
			return file.replace(/MVC\.Initializer\(function\(\)\{/, 
				"MVC.Initializer(function(){\ninclude."+include_type+"();\n");
		}
		return file;
	},
	modify_includes: function(include_type, file, file_to_check, add){
		file_to_check = file_to_check.replace(/\s+/g,'');
	    var regexp_include = new RegExp("include\\." + include_type + "\\((.*)\\)");
		if(!file.match(regexp_include))
			file = this.add_to_include_file(include_type,file);
	    var str = "include." + include_type + "(";
	    var items = this.list_of_items(include_type, file);
	    var name_arr = [];
	    for (var i = 0; i < items.length; i++) {
	        if (items[i] != file_to_check) 
	            name_arr.push("'" + items[i] + "'");
	    }
	    if (add) 
	        name_arr.push("'" + file_to_check + "'");
	    
	    str += name_arr.join(',');
	    str += ')';
	    return file.replace(regexp_include, str);
	},
	add_path : function(include_type, file_path, file_to_add){
	    var file = Mozilla.readFile(file_path);
	    var str = this.add_include(include_type, file, file_to_add);
	    Mozilla.saveFile(file_path, str, true);
	},
	remove_path : function(include_type, file_path, file_to_remove){
	    var file = Mozilla.readFile(file_path);
	    var str = this.remove_include(include_type, file, file_to_remove);
	    Mozilla.saveFile(file_path, str, true);
	},
	list_of_items : function(include_type, file){
	    var name_arr = [];
	    var regexp_include = new RegExp("include\\." + include_type + "\\((.*)\\)");
	    var regexp_items = /\'([\w|\/]+)\'/g;
	    var match_arr = [];
	    var match = file.match(regexp_include);
	    while (match_arr = regexp_items.exec(match[1])) {
	        if (match_arr[1]) 
	            name_arr.push(match_arr[1]);
	    }
	    return name_arr;
	},
	join: function(){
		var path_arr = [];
		for(var i=0; i<arguments.length; i++){
			path_arr.push(arguments[i]);
		}
		return path_arr.join(MVC.Path.slash);
	}
}

if (navigator.appVersion.indexOf("Win")!=-1){
	MVC.Path.slash = "\\";
	MVC.Windows = true;
} else {
	MVC.Path.slash = "/";
	MVC.Windows = false;
}