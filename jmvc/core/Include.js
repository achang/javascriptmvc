/**
 * <p>JMVC.include is a class that loads various file types from the server onto the client machine</p>
 * 
 * @constructor
 * @class
 * <p>Javascript Templates (.jst), css, and javascript files all can be loaded using this class</p>
 *
 * <p>Users can load their own javascript files, stylesheets, or template files using a single entry point: include.
 * JMVC.include.include is made accessible as window.include.  Users can use it as follows:</p>
 * <pre class='example'>
 *  include('javascripts/special_functions.js');
 *  include('stylesheets/my_style.css');
 *  include('expenses/report.jst')</pre>
 *
 * <p>The above examples show relative paths, and include will intelligently prepend the remainder of the file path using
 * the current application's client and project name.  Absolute paths also are handled correctly.</p>
 */
JMVC.include =function(path, options) {
    options = options || {};
    var cache = options.cache ? options.cache : (JMVC.cache_templates || false);
    var synchronous = options.synchronous ? options.synchronous : false;
    
    var file = new jFile(path +(cache == false ? "?"+Math.random(): "") );
	var ex = file.extension().toUpperCase()
	if(! JMVC.include[ 'include_'+ex ] ) throw 'Unknown data type included'
	
	return JMVC.include[ 'include_'+ex ]( file.absolute() , synchronous);

};

var include = JMVC.include;



/**
 * <p>Checks if the javascript file was already loaded.  If not, it is loaded into the page.</p>
 *
 * @param {String} path The path of the requested javascript file
 */
JMVC.include.include_JS = function(path, synchronous) {
    
        if(!synchronous)
            document.write('<script type="text/javascript" src="'+path+'"></script>');
        else {
            var response = JMVC.request(path)
			if(!response) return null;
			window.eval(response);
        }

}

/**
 * <p>Checks if the stylesheet file was already loaded.  If not, it is loaded into the page.</p>
 *
 * @param {String} path The path of the requested stylesheet
 */
JMVC.include.include_CSS = function(path) {
	var head = document.getElementsByTagName('head')[0]
	var link = document.createElement('link')
	link.setAttribute("type","text/css")
	link.setAttribute("rel","stylesheet")
	link.setAttribute("href",path)
	head.appendChild(link)
}
JMVC.include.css = function(file){
	JMVC.include('stylesheets/'+file+'.css')
}
// JMVC request

JMVC.newRequest = function(){
   var factories = [function() { return new XMLHttpRequest(); },function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
   for(var i = 0; i < factories.length; i++) {
        try {
            var request = factories[i]();
            if (request != null)  return request;
        }
        catch(e) { continue;}
   }
}
	
JMVC.request = function(path){
   var request = new JMVC.newRequest()
   request.open("GET", path, false);
   
   try{request.send(null);}
   catch(e){return null;}
   
   if ( request.status == 404 || request.status == 2 ||(request.status == 0 && request.responseText == '') ) return null;
   
   return request.responseText
}


