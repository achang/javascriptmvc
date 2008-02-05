//Create onerror handler that posts to errors/
//Create controller that tags errors and emails me when / if they happen in production

/* what do I want?
 * -action / controller
 * -session
 * -browser
 * -url
 * -turn on reporting ... ? controllers and actions they have been to, need way to ingore moover
 * -page html? ... return the page (this would be useful for replaying errors)
 * -
 */


JMVC.error_handler = function(msg, url, l){
	JMVC.handle_error(new BrowserError(msg, url, l) )
};

window.onerror = JMVC.error_handler;


JMVC.handle_error = function(error){
	if(include.get_env() == 'production')
		new Ajax.Request('/errors', {method: 'post', postBody: 'title='+encodeURIComponent(error.title())+'&message='+encodeURIComponent(error.message()), onComplete: function(){
				alert('sent errror');
		}} );
	else
		alert(error.toString());
};
BrowserError = function(error, url, line){
	this.error = error;
	this.file = url;
	this.line = line;
};
BrowserError.prototype = {
	location : function(){
		return location.href;
	},
	title : function(){
		return this.location() + ' '+this.error;
	},
	browser : function(){
		return navigator.userAgent;
	},
	message : function(){
		return ['There was an error in '+this.file,
				'On line: '+this.line,
				'Error: '+this.error,
				'Browser: '+this.browser()].join("\n");
	},
	toString : function(){
		return this.message();
	}
};