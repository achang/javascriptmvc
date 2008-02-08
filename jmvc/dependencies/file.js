/**
 * jFile provides convenient helper functions for URLs and file paths.
 * @constructor
 * 
 * @classDescription
 * jFile provides a set of methods and instance functions to help the user gain easy access to different features
 * associated with the path.
 * 
 * @param {Object} path_name full path to file
 */
jFile = function(path_name) {
    this.path_name = path_name;
    this.path_array = this.path_name.split('/'); //splits path
    this.last_index = this.path_array.length-1; //number things in array
};

/**
 * jFile instance functions
 */
jFile.prototype = {
	/**
	 * Returns the extension at the end of the path if it exists.
	 */
    extension : function() {
		var both = this.file_and_extension();
		return ( both.lastIndexOf('.') == -1 ? 
					null : 
					both.substring(both.lastIndexOf('.')+1 )
				);
    },
	/**
	 * Returns the name of the file without .extension at the end.
	 */
    file_name : function() {
		return this.file_and_extension().split('.')[0];
    },
	/**
	 * Checks for complete URL or file path
	 */
    is_absolute : function() {
        return (this.path_name.substring(0,1) == "/" || this.path_name.substring(0,7) == 'http://' || this.path_name.substring(0,7) == 'file://' || this.path_name.substring(0,8) == 'https://');
    },
	/**
	 * Returns (file name).(extension)
	 */
	file_and_extension : function(){
		return this.path_array[this.last_index].split(/[\?#&]/)[0];
	},
	/**
	 * Returns the complete URL or file path
	 */
	absolute : function(){
		return (this.is_absolute() ? this.path_name : jFile.get_cwd() + this.path_name);
	},
	/**
	 * Returns the file path up to the working directory
	 * (doesn't include the file name and extension).
	 */
	directory : function(){
		var path_array_copy = this.path_name.split("/");
		path_array_copy.pop();
		return path_array_copy.join('/');
	}
};
/**
 * Joins two paths
 */
jFile.join = function() {
    var cleaned = [];
	for(var i=0; i < arguments.length ; i ++){
		if(arguments[i].replace(/\s+/g, '') != '')
			cleaned.push(arguments[i].replace(/^\/+/, '').replace(/\/+$/, ''));
	}
	return (arguments[0].slice(0,1) == '/' ? '/' : '' )+cleaned.join("/");
};

//shortcut to filename from above - don't need to create a jFile to use
/**
 * Returns the filename (with extension) at the end of the path.
 * @param {Object} path file path
 */
jFile.original_filename = function(path) {
    var path_array = path.split('/');
    if(path_array.length == 1)
        path_array = path.split('\\');
    return path_array[path_array.length-1];
};


/**
 * Sets up the current working directory.
 */
jFile.setup =  function(){
	var cwd;
	/**
	 * Returns the current working directory.
	 */
	jFile.get_cwd = function(){ return cwd;};
	
	//makes sure it always has an ending /
	/**
	 * Sets the current working directory to the parameter.
	 * @param {Object} newcwd
	 */
	jFile.set_cwd = function(newcwd){
		cwd = newcwd+(newcwd[newcwd.length - 1] == '/' ? '' : '/');
	};
	jFile.set_cwd(typeof APPLICATION_ROOT == 'undefined' ? 
					location.href.substring(0, location.href.lastIndexOf('/') )+ '/' :
					APPLICATION_ROOT);
};
jFile.setup();



