/**
 * MVC.JFile provides convenient helper functions for URLs and file paths.
 * @constructor
 * 
 * @classDescription
 * MVC.JFile provides a set of methods and instance functions to help the user gain easy access to different features
 * associated with the path.
 * 
 * <p>Example: </p>
 * <pre class='example'>
 * var test = new MVC.JFile('/dir2/dir1/file1.txt');
 * </pre>
 * 
 * @param {Object} path_name full path to file
 */
MVC.JFile = function(path_name) {
    this.path_name = path_name;
    this.path_array = this.path_name.split('/'); //splits path
    this.last_index = this.path_array.length-1; //number things in array
};

/**
 * MVC.JFile instance functions
 */
MVC.JFile.prototype = {
	/**
	 * Returns the extension at the end of the path if it exists.
	 * 
	 * <p>Example: </p>
 	 * <pre class='example'>
 	 * (new MVC.JFile('/dir2/dir1/file1.txt').extension()
 	 * </pre>
 	 * returns "txt"
 	 * 
 	 * @return {string} file extension
	 */
    extension : function() {
		var both = this.file_and_extension();
		return ( both.lastIndexOf('.') == -1 ? 
					null : 
					both.substring(both.lastIndexOf('.')+1 )
				);
    },
	/**
	 * Returns the name of the file without the extension.
	 * 
	 * <p>Example: </p>
 	 * <pre class='example'>
 	 * (new MVC.JFile('/dir2/dir1/file1.txt').file_name()
 	 * </pre>
 	 * returns "file1"
  	 * "file1"
 	 * 
 	 * @return {string} file name
	 */
    file_name : function() {
		return this.file_and_extension().split('.')[0];
    },
	/**
	 * Checks whether the given file path or URL is absolute, as opposed to relative.
	 * 
	 * <p>Example: </p>
 	 * <pre class='example'>
 	 * (new MVC.JFile('/dir2/dir1/file1.txt').is_absolute()
 	 * </pre>
 	 * returns TRUE
 	 * 
 	 * @return {bool} TRUE if path starts with '/', 'http://', 'file://', or https:// and FALSE otherwise
	 */
    is_absolute : function() {
        return (this.path_name.substring(0,1) == "/" || this.path_name.substring(0,7) == 'http://' || this.path_name.substring(0,7) == 'file://' || this.path_name.substring(0,8) == 'https://');
    },
	/**
	 * Returns (file name).(extension)
	 * 
	 * <p>Example: </p>
 	 * <pre class='example'>
 	 * (new MVC.JFile('/dir2/dir1/file1.txt').file_and_extension()
 	 * </pre>
 	 * returns "file1.txt"
 	 * 
 	 * @return {string} file name and extension
	 */
	file_and_extension : function(){
		return this.path_array[this.last_index].split(/[\?#&]/)[0];
	},
	/**
	 * Returns the complete URL or file path.  If the path is relative, combines the current
	 * working directory with the relative path.
	 * 
	 * <p>Example: </p>
 	 * <pre class='example'>
 	 * (new MVC.JFile('/dir2/dir1/file1.txt').absolute()
 	 * </pre>
 	 * returns "/dir2/dir1/file1.txt"
 	 * 
 	 * @return {string} absolute path
	 */
	absolute : function(){
		return (this.is_absolute() ? this.path_name : MVC.JFile.get_cwd() + this.path_name);
	},
	/**
	 * Returns the file path up to the working directory
	 * (doesn't include the file name and extension).
	 * 
	 * <p>Example: </p>
 	 * <pre class='example'>
 	 * (new MVC.JFile('/dir2/dir1/file1.txt').directory()
 	 * </pre>
 	 * returns "/dir2/dir1"
 	 * 
 	 * @return {string} path directory preceding file name and extension
	 */
	directory : function(){
		var path_array_copy = this.path_name.split("/");
		path_array_copy.pop();
		return path_array_copy.join('/');
	}
};
/**
 * Joins two paths
 * 
 * <p>Example: </p>
 * <pre class='example'>
 * MVC.JFile.join('test_apps', 'simple', 'holla.MVC.View')
 * </pre>
 * Returns "test_apps/simple/holla.MVC.View"
 * 
 * @param two partial paths
 */
MVC.JFile.join = function() {
    var cleaned = [];
	for(var i=0; i < arguments.length ; i ++){
		if(arguments[i].replace(/\s+/g, '') != '')
			cleaned.push(arguments[i].replace(/^\/+/, '').replace(/\/+$/, ''));
	}
	return (arguments[0].slice(0,1) == '/' ? '/' : '' )+cleaned.join("/");
};

//shortcut to filename from above - don't need to create a MVC.JFile to use
/**
 * Returns the filename (with extension) at the end of the path.
 * 
 * <p>Example: </p>
 * <pre class='example'>
 * MVC.JFile.original_filename('/dir2/dir1/file1.txt')
 * </pre>
 * Returns "file1.txt"
 * 
 * @param {Object} path file path
 */
MVC.JFile.original_filename = function(path) {
    var path_array = path.split('/');
    if(path_array.length == 1)
        path_array = path.split('\\');
    return path_array[path_array.length-1];
};


/**
 * Sets up the current working directory.
 * 
 * <p>Example: </p>
 * <pre class='example'>
 * MVC.JFile.setup()
 * </pre>
 */
MVC.JFile.setup =  function(){
	var cwd;
	/**
	 * Returns the current working directory.
	 * 
	 * <p>Example: </p>
 	 * <pre class='example'>
 	 * var cwd = MVC.JFile.get_cwd()
 	 * </pre>
 	 * Returns the current working directory
	 */
	MVC.JFile.get_cwd = function(){ return cwd;};
	
	//makes sure it always has an ending /
	/**
	 * Sets the current working directory to the parameter.
	 * 
	 * <p>Example: </p>
 	 * <pre class='example'>
 	 * MVC.JFile.set_cwd('http://something.com/here/')
 	 * </pre>
	 * 
	 * @param {Object} newcwd
	 */
	MVC.JFile.set_cwd = function(newcwd){
		cwd = newcwd+(newcwd[newcwd.length - 1] == '/' ? '' : '/');
	};
	MVC.JFile.set_cwd(typeof APPLICATION_ROOT == 'undefined' ? 
					location.href.substring(0, location.href.lastIndexOf('/') )+ '/' :
					APPLICATION_ROOT);
};
MVC.JFile.setup();



