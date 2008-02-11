//all of this might be brought into include
/**
 * <p>Checks if the javascript file was already loaded.  If not, it is loaded into the page.</p>
 *
 * @param {String} path The path of the requested javascript file
 */
//we need a function that can figure this out in include that this guy can use
include.css = function(path){
	var head = document.getElementsByTagName('head')[0];
	var link = document.createElement('link');
	link.setAttribute("type","text/css");
	link.setAttribute("rel","stylesheet");
	link.href= include.normalize( 'resources/stylesheets/'+path+(path.indexOf('.css')== -1 ?'.css':''));
	head.appendChild(link);
};


// JMVC request
include.controllers = function(){
	for(var i=0; i< arguments.length; i++){
		arguments[i] = 'app/controllers/'+arguments[i]+'_controller';
	}
	return include.apply(null, arguments);
}



