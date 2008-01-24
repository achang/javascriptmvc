jFile = function(path_name) {
    this.path_name = path_name
    this.path_array = this.path_name.split('/');
    this.last_index = this.path_array.length-1;
}
jFile.prototype = {
    extension : function() {
		var both = this.file_and_extension();
		return ( both.lastIndexOf('.') == -1 ? 
					null : 
					both.substring(both.lastIndexOf('.')+1 )
				)
    },
    file_name : function() {
		return this.file_and_extension().split('.')[0];
    },
    is_absolute : function() {
        return (this.path_name.substring(0,1) == "/" || this.path_name.substring(0,7) == 'http://' || this.path_name.substring(0,7) == 'file://' || this.path_name.substring(0,8) == 'https://');
    },
	file_and_extension : function(){
		return this.path_array[this.last_index].split(/[\?#&]/)[0]
	},
	absolute : function(){
		return (this.is_absolute() ? this.path_name : jFile.get_cwd() + this.path_name)
	},
	directory : function(){
		var path_array_copy = this.path_name.split("/");
		path_array_copy.pop()
		return path_array_copy.join('/');
	}
};
jFile.join = function() {
    var cleaned = [];
	for(var i=0; i < arguments.length ; i ++){
		if(arguments[i].replace(/\s+/g, '') != '')
			cleaned.push(arguments[i].replace(/^\/+/, '').replace(/\/+$/, ''));
	}
	return (arguments[0].slice(0,1) == '/' ? '/' : '' )+cleaned.join("/");
}


jFile.original_filename = function(path) {
    var path_array = path.split('/');
    if(path_array.length == 1)
        path_array = path.split('\\');
    return path_array[path_array.length-1];
}


jFile.setup =  function(){
	var cwd;
	jFile.get_cwd = function(){ return cwd;}
	
	//makes sure it always has an ending /
	jFile.set_cwd = function(newcwd){
		cwd = newcwd+(newcwd[newcwd.length - 1] == '/' ? '' : '/')
	}
	jFile.set_cwd(typeof APPLICATION_ROOT == 'undefined' ? 
					location.href.substring(0, location.href.lastIndexOf('/') )+ '/' :
					APPLICATION_ROOT)
} 
jFile.setup()



