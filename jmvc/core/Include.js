JMVC.newRequest = function(){
   var factories = [function() { return new XMLHttpRequest(); },function() { return new ActiveXObject("Msxml2.XMLHTTP"); },function() { return new ActiveXObject("Microsoft.XMLHTTP"); }];
   for(var i = 0; i < factories.length; i++) {
        try {
            var request = factories[i]();
            if (request != null)  return request;
        }
        catch(e) { continue;}
   }
};
	
JMVC.request = function(path){
   var request = new JMVC.newRequest();
   request.open("GET", path, false);
   
   try{request.send(null);}
   catch(e){return null;}
   
   if ( request.status == 404 || request.status == 2 ||(request.status == 0 && request.responseText == '') ) return null;
   
   return request.responseText;
};


/**
 * <p>Checks if the javascript file was already loaded.  If not, it is loaded into the page.</p>
 *
 * @param {String} path The path of the requested javascript file
 */
include.sync = function(path) {
    var response = JMVC.request(path);
	if(!response) return null;
	window.eval(response);
};
include.css = function(path){
	var head = document.getElementsByTagName('head')[0];
	var link = document.createElement('link');
	link.setAttribute("type","text/css");
	link.setAttribute("rel","stylesheet");
	link.setAttribute("href",path);
	head.appendChild(path);
}
// JMVC request




