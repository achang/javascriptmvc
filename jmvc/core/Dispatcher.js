/**
 * 
 * @class Dispatcher contains the methods that create new controller instances and call their actions
 *
 * @addon
 */
JMVC.Dispatcher = function() {}


JMVC.Dispatcher.initialize = function() {
	JMVC.RECORD_HISTORY = true;
	window.historyStorage.init();
	window.dhtmlHistory.create();
	dhtmlHistory.initialize();
	dhtmlHistory.addListener(JMVC.Dispatcher.historyChange);
}
if(JMVC.RECORD_HISTORY)
	JMVC.JMVC_startup_tasks.push(JMVC.Dispatcher.initialize)

JMVC.Dispatcher.historyChange = function(newLocation, historyData) {
	if(historyData) { //the person has been here before
		JMVC.Routes.clear_route_cache();
		JMVC.Dispatcher.request("get", historyData);
	} else { //they changed the url themselves
		JMVC.Routes.clear_route_cache();
		JMVC.Dispatcher.request("get", JMVC.Routes.params());
	}
		
}
JMVC.Dispatcher.add_to_history = function(options){
	if(JMVC.RECORD_HISTORY){
		var added_url =  JMVC.Routes.url_for(options)
		dhtmlHistory.add(added_url, options);
	}
		
}


/**
 * <p>calls the request method</p>
 * <p>This method is also available in window as get</p>
 * <p>get_request is called by any link_to created links</p>
 * <p>Any call to get_request is kept track of for back button functionality</p>
 *
 * @param {Hash} options A hash of params that tell the dispatcher which controller and action to invoke and what parameters to pass in
 *
 * @return The string produced by the render call in the called action
 */
JMVC.Dispatcher.get_request = function(options) {
	JMVC.Routes.clear_route_cache();
	var options = Object.extend(
	      { action: JMVC.Routes.params()['action'],
	        controller: JMVC.Routes.params()['controller']
	      }, options || {} );
	// TODO this is hack to get around the url params problem
	var history_options = $H(Object.clone(options))
	JMVC.Dispatcher.add_to_history(history_options) // adds this to history
	return JMVC.Dispatcher.request("get", options);
}
var get = JMVC.Dispatcher.get_request

/**
 * <p>calls the request method</p>
 * <p>This method is also available in window as post</p>
 * <p>post_request is called by any JMVC forms when they are submitted</p>
 *
 * @param {Hash} options A hash of params that tell the dispatcher which controller and action to invoke and what parameters to pass in
 *
 * @return The string produced by the render call in the called action
 */
JMVC.Dispatcher.post_request = function(options, controller) {
	JMVC.Routes.clear_route_cache();
    var options = Object.extend(
	      { action: JMVC.Routes.params()['action'],
	        controller: JMVC.Routes.params()['controller']
	      }, options || {} );
	return JMVC.Dispatcher.request("post", options, controller);
}
var post = JMVC.Dispatcher.post_request;

/**
 * <p>calls the request method</p>
 * <p>This method is called from the request whenever an action redirects to another action</p>
 * <p>If the asynchronous_request flag is set to true, redirect_request will save the redirection in a closure called
 * JMVC.Dispatcher.resume_execution, which is called when the execution returns from whatever asynchronous action was taken.</p>
 *
 * @param {Hash} options A hash of params that tell the dispatcher which controller and action to invoke and what parameters to pass in
 *
 * @return The string produced by the render call in the called action
 */
JMVC.Dispatcher.redirect_request = function(options) {
	var options = Object.extend(
	      { action: JMVC.Routes.params()['action'],
	        controller: JMVC.Routes.params()['controller']
	      }, options || {} );
	JMVC.Dispatcher.add_to_history(options)
	
	/*if(JMVC.Dispatcher.asynchronous_request == true) {
        // create a closure to be called when execution resumes
        JMVC.Dispatcher.resume_execution = function() {
            JMVC.Dispatcher.asynchronous_request = false;
            return JMVC.Dispatcher.request("redirect", options);
        }
        return;
    }
    else*/
        return JMVC.Dispatcher.request("redirect", options);
}
/*JMVC.Dispatcher.callback = function(params ){
	params = params || {}
	return function() {
		params.arguments = arguments 
		return JMVC.Dispatcher.request("post", params);
	}

var callback = JMVC.Dispatcher.callback}*/

JMVC.Dispatcher.get_controller_name = function(controller_option){
	if(!controller_option) throw 'no controller given to dispatcher'
	var controller_name = controller_option.split('_').invoke('capitalize').join('')+ "Controller";
    if(!window[controller_name]){
		include(JITS.File.join(APPLICATION_ROOT,'app','controllers',controller_option+'_controller.js' ), 
					{synchronous: true, cache: (JMVC.ENV.ENVIRONMENT == 'development' ? false : true)  })
	}
	var controller_class = window[controller_name];
    if (!controller_class || typeof(controller_class) != 'function') throw new JMVC.Error(new Error(), controller_name+' is not a recognized controller name');
	return controller_name
}

/**
 * <p>Called by get_request or post_request</p>
 * <p>Tries to create the controller instance from the given parameters, then tries to invoke the given action.</p>
 * <p>Performs error handling by placing a try...catch around the action invocation and redirecting any errors to the error_handler action.</p>
 * <p>Finally, it checks if rendering has been performed.  If not, it performs the default render and redirects or renders to the correct location.</p>
 *
 * @param {String} type Either 'get' or 'post', signifying the type of request made
 * @param {Hash} options A hash of params that tell the dispatcher which controller and action to invoke and what parameters to pass in
 *  <p>including action and/or controller in this hash will tell the dispatcher which controller/action to invoke</p>
 *  <p>including arguments beside controller/action in this hash will make these arguments appear in the controller instance's params attribute</p>
 *
 * @return The string produced by the render call in the called action
 */
JMVC.Dispatcher.request = function(type, params, continue_to_controller) {
	if(!params) { alert("no options given to dispatcher"); throw 'no options given to dispatcher'; }
	if(!params.action) throw 'no action given to dispatcher'
	
	try {
	    var controller_name = JMVC.Dispatcher.get_controller_name(params.controller)
		
		//var params = JMVC.Routes.params(); // what is this for?  shouldn't everything be passed in?
	    //params = $H().merge(options); //?
			
	    if(!continue_to_controller){
			var controller_class = window[controller_name];		
		    var controller = new (controller_class)(controller_name, type); // it should know its name w/o being passed in
			if(controller_class.before_filter) controller[controller_class.before_filter](params)
		}else{
			controller = continue_to_controller
			controller._rendered = false;
		}
		// give the instance the params and the action
		controller.params = params
		controller.action_name = params.action
	    
		
		//if there is an action, call it
		if(controller[params.action])
	        controller[params.action](params);
	    else {
			//otherwise render the template
			try {
				controller.render( {action: params.action} );
			} catch(e) {
				if(e instanceof JMVC.IncludeError) throw new JMVC.Error(new Error(), 'Unknown action: No action responded to '+options.action);
				throw e;
			}
		}
	    
	    if (controller._redirected) {
	        //controller.session.flash = controller.flash;
	        return JMVC.Dispatcher.redirect_request(controller._redirected);
	    }
		if (controller._rendered == false)
			controller.render( {action: params.action} );
	
	    //controller.session.flash = null;
	        
	    return controller._rendered_result;
	} catch(e) {
		JMVC.Framework.render_error(e);
		return;
	}
}