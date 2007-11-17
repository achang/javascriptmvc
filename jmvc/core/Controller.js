/**
 * @fileoverview
 * The Controller.js file contains an Javascript implementation of the 
 * active controller design pattern and supporting functionality.
 * <p class='credits'>JavaScript Junction based off <a href='http://trimpath.com/'>TrimJunction framework</a>.
 * @author Jupiter Information Technology Solutions - Brian Moschel, Justin Meyer.<br/>
 * @version 0.1
 */

/**
 * For inheritance purposes, this function calls the initialize function.
 * @constructor
 * @class
 * <p>Junction.Controllers are the core of a web request in Junction. 
 * They are made up of one or more actions that are executed on request and then either render a template or redirect to another action. 
 * An action is defined as a method on the controller, which will automatically be made accessible through the dispatcher. 
 * A sample controller could look like this:</p>
 *
 * <pre class='example'>
 *  var GuestBookController  = Class.create(Junction.Controller, {
 *     index : function(params) {
 *           this.entries = Entry.find('all');
 *     },
 *
 *     sign : function(params) {
 *           Entry.create( params['Entry'] );
 *           this.redirect_to( { action : 'index' } )
 *     }
 *   });</pre>
 *
 * <p>Actions, by default, render a template in the app/views directory corresponding to the name of the controller and action after executing code in the action. 
 * For example, the index action of the GuestBookController would render the template app/views/guestbook/index.jst 
 * by default after populating the entries instance variable. </p>
 *
 * <p>Unlike index, the sign action will not render a template. After performing its main purpose 
 * (creating a new entry in the guest book), it initiates a redirect instead.</p>
 * 
 * <p>The index and sign represent the two basic action archetypes used in Action Controllers. 
 * Get-and-show and do-and-redirect. Most actions are variations of these themes.</p>
 *
 * <h4>Requests</h4>
 *
 * <p>Requests are processed by the Junction.Controller framework by extracting the value of the "action" key in the options parameter sent to the 
 * <b>get</b> or <b>post</b> methods of Junction.Dispatcher.  This value should hold the name of the action to be performed.  Once the action
 * has been identified, the remaining request parameters and the session are made available to the action through instance variables.  Then the 
 * action is performed.</p>
 * 
 * <p>Routes are used to determine the controller and action key from the requesting url.  
 * For example, with the default routes:<p>
 * <pre class='example'>
 * http://scaffold.com/company_project#task/list</pre>
 * calls the list function in TaskController.
 * <h4>Parameters</h4>
 *
 * <p>All request parameters, whether they come from a GET or POST request are available through 
 * the params function parameter, which is a hash.  For 
 * example, an action that was performed through get( {action: 'list', limit: 5, category: "Horse"} ) will include {limit: 5, category: "Horse"}
 * in params.</p>
 *
 * <p>It's also possible to construct multi-dimensional parameter hashes by specifying keys using brackets in form element names:</p>
 *
 * <pre class='example'>
 * <#input type="text" name="post[name] value='Bob'>
 * <#input type="text" name="post[city] value='Chicago'>
 * </pre>
 *
 * <p>A request stemming from a form holding these inputs will include { post: {name: 'Bob', city: 'Chicago'} }.  The limit of nesting is two 
 * levels.</p>
 *
 * <h4>Sessions</h4>
 *
 * <p>You don't need them!  Everything runs in the page.  A best practice is to create Class variables
 * and functions to store your non-database data.</p>
 *
 * <h4>Responses</h4>
 *
 * <p>Each action results in a response, which displays content in the user's browser or jumps to a new action.
 * The actual response object is generated automatically through the use of
 * renders and redirects and requires no user intervention.</p>
 *
 * <h4>Renders</h4>
 * 
 * <p>Junction.Controller places content on the page by using one of two rendering methods.  The most versatile and common is the rendering of a template. Included in Junction is 
 * Junction.Template, which renders javascript template (jst) files.  In the context of an MVC architecture, these template files are called views.  
 * The controller passes objects to the views by assigning instance variables:</p>
 * <pre class='example'>
 *     show : function(params) {
 *           this.post = Post.find(params.id);
 *     }</pre>
 * <p>Which are then automically available in the view:</p>
 * <pre class='example'>
 *     Title: &lt;%=post.title%></pre>
 * <p>You don't have to rely on the automated rendering.  Especially actions that could result in the rendering of different templates will use the manual rendering methods:</p>
 * <pre class='example'>
 *     search : function(params) {
 *           this.results = Search.find(params.query);
 *           switch(this.results.length) {
 *               case (0):
 *                  this.render( {action: 'no_results'} );
 *                  break;
 *               case (1):
 *                  this.render( {action: 'show'} );
 *                  break;
 *               default:
 *                  this.render( {action: 'show_many'} );
 *                  break;
 *           }
 *     }</pre>
 * <p>Read more about javascript templates in Junction.Template</p>
 *
 * <h4>Redirects</h4>
 * 
 * <p>Redirects are used to jump from one action to another.  For example, after a create action, which stores a blog entry to a database, 
 * we might like to show the user the new entry. 
 * Because we‘re following good DRY principles (Don‘t Repeat Yourself), 
 * we‘re going to reuse (and redirect to) a show action that we‘ll assume has already been created. 
 * The code might look like this: </p>
 * <pre class='example'>
 *     create : function(params) {
 *           this.entry = Entry.new_instance(params.entry);
 *           if(!this.entry.save().errors) {
 *              // the entry as saved correctly, redirect to show
 *              this.redirect_to( { action: <span>'show'</span>, id: <span>entry.id</span> } );
 *           }
 *           else
 *              // things didn't go so well, do something else
 *     }</pre>
 *
 * <p>In this case, after saving our new entry to the database, the user is redirected to the show method, which is then executed.  If you don't supply a controller, redirect_to assumes you are redirecting to an
 *  action in the current controller.</p>
 *
 * @see Junction.View
 * @see Junction.ActiveRecord
 */
Junction.Controller = function(){};
Junction.Controller.prototype = {
    /**
     * Creates a new controller instance.  Overwrite for inheritiance.
     * @param {Object} klass_name
     * @param {Object} type
     */
    initialize : function(klass_name, type) {
        // for introspection inside the controller instance
        this.klass_name = klass_name;
        // Holds data that should persist across controller actions for this controller
        this.controller_session = this.klass().controller_session || {};
        this.request_type = type;
        this.session = Junction.Framework.get_session();
        this.flash = Junction.Framework.get_session().flash;
        this.render_container_id = Junction.View.RENDER_TO;
        this._rendered = false;
		// this saves the rendered text to be returned
		this._render_result = null;
        this._redirected = null;
        this._attrs_removed_before_render = {};
        var exclude_from_removal = {"klass" : true, "klass_name": true, "redirect_to" : true, "redirect_to_external" : true, "render" : true};
        for(var element in this) {
            if(!exclude_from_removal[element])
                this._attrs_removed_before_render[element] = true;
        }
    },
    /**
     * Returns the object's class.  This is usefull for introspection.
     */
    klass : function(){
        if(this.klass_name)
            return window[this.klass_name];
    },
    /**
     * Packages an object to send to the view.  The views get a copy of the controller's 
     * data and functions.  This function creates a object that is a copy of the controller for 
     * use by the views.
     * @private
     * @throws An error if someone overwrites a function that is in view.
     * @return {Object} Object copied from controller data used for the view.
     */
    prepare_template_data : function() {
        // remove any attributes from the controller that were not set by the action
        var data = {};
        Object.extend(data, this);
        for(var attr in this._attrs_removed_before_render)
			if(attr != 'render' && attr != 'prepare_template_data' && attr != 'render_templates')
            	delete data[attr];
        // allow view methods to be accessible in views
		for(var attr in view) {
			if(data[attr] != null)
				throw(new Junction.Error(new Error(), attr+' is a method in Junction.View.  You cannot name controller instance attributes the same as any Junction.View attributes.'))
			else
				data[attr] = view[attr];
		}
        return data;
    },
    /**
     * Redirects the browser to the target specified in options.  This parameter can take one of 2 forms.
     *
     *      <p><ul>
     *      <li>Hash - The redirection options will be stored and later passed to get().</li>
     *      <pre class='example'>
     *           this.redirect_to( {action: <span />'show', id: <span />5} )</pre>
     *      <li>back - Back to the page that issued the previous request?</li>
     *      <pre class='example'>
     *           this.redirect_to( {back: <span />true} )</pre>
     *      </ul></p>
     * 
     */
     //TODO: are we actually supporting back or a string?
    redirect_to : function(options) {
        options = options || {}
		options.controller = options.controller || this.params.controller
		var params = Object.extend(
          { action: Junction.Routes.params()['action'],
            controller: Junction.Routes.params()['controller']
          }, options || {} );
        if(this._redirected != null) // already rendered or redirected
			throw new Junction.Error(new Error(), 'Cannot call render twice in the same action.');
        this._redirected = params;
    },
    /**
     * Renders the content that will be returned to the browser as the response body.
     *
     * @param {Object} options a set of optional parameters that define render's behavior
     *      <p><ul>
     *      <li>action (string) - The name of the action to be rendered.  Render will try to look for a local template for this action.</li>
     *      <pre class='example'>
     *           this.render( {action: <span />'list'} )</pre>
     *      <li>template (string) - The user specifies the location of the template to be rendered.  The supplied path is relative to the application's views directory</li>
     *      <pre class='example'>
     *           this.render( {template: <span />'expenses/add_task'} )</pre>
     *      <li>update_id (string) - The id of the element in the page where the result of render will be displayed</li>
     *      <pre class='example'>
     *           this.render( {update_id: <span />'lightbox', action: <span />'destroy'} )</pre>
     *      <li>text (string) - Text to be rendered to the screen in place of a template</li>
     *      <pre class='example'>
     *           this.render( {text: <span />'&lt;h1&gt;hello world&lt;/h1&gt;'} )</pre>
     *      <li>partial (boolean) - Partial rendering returns the result of the rendering to be placed in the rendered page. This function is typically used by views that want to share components, for example a navigation template.</li>
     *      <pre class='example'>
     *           this.render( {partial: <span />true, template: <span />'main/navigation'} )</pre>
     *      </ul></p>
     * @return {String} text that was rendered.
     */
     // if we redirect, shouldn't redirect call nothing?
    render : function(options) {
    
        if(options.update_id) {
            this.render_container_id = options.update_id;
        }
        
        if(options.nothing && options.nothing == true) {
            this._rendered = true;
            return '';
        }
        if(options.text) {
            this._rendered = true;
            var result = options.text;   
        }
        else {
            if(options.action) {
                var folder_name = Junction.Routes.params()['controller'];
                var suggestions = APPLICATION_ROOT+'app/views/'+folder_name+'/'+options.action+".jst";
                var file_name = options.action+'.jst';
            }
            else if(options.template) {
                if(! options.template.include('/'))
					options.template = this.params.controller+'/_'+options.template
				else
					options.template = options.template.split('/').join('/_')
				var suggestions = APPLICATION_ROOT+'app/views/'+options.template+'.jst';
                var file_name = options.template+'.jst';
            }
			else if(options.partial) {
                if(! options.partial.include('/'))
					options.partial = this.params.controller+'/_'+options.partial
				else
					options.partial = options.partial.split('/').join('/_')
				var suggestions = APPLICATION_ROOT+'app/views/'+options.partial+'.jst';
				var file_name = this.params.controller+'/_'+options.partial+'.jst';
			}
            else {
                var suggestions = APPLICATION_ROOT+'app/views/'+Junction.Routes.params()['controller']+'/'+Junction.Routes.params()['action']+'.jst';
				var file_name = Junction.Routes.params()['action']+'.jst';
            }
	        var template = Junction.Template.look_for_template(suggestions);
	        if(template) {
				var result = this.render_templates(template, options.partial, null, options.locals);
	        } else
				throw new Junction.IncludeError(new Error(), 'Template not found: '+file_name);
			// layouts ***
			// first, if this is a partial, skip any layout checks
			// next check if layout is passed in as an option (can be false or point to another layout)
			// next check if the layout template has been cached for this controller
			// next check if the user overrides the layout attribute
			// finally check for the application.jst layout
			if(!(options.partial || options.template || options.layout == false)) {
				if(options.layout)
					var layout_path = APPLICATION_ROOT+'app/views/layouts/'+options.layout+'.jst';
				else if(this.klass()._layout_template != null)
					var template = this.klass._layout_template;
				else if(this.klass().layout)
					var layout_path = APPLICATION_ROOT+'app/views/layouts/'+this.klass().layout+'.jst';
				if(layout_path && this.klass()._layout_template == null) {
					this.klass()._layout_template = Junction.Template.look_for_template(layout_path);
					if(this.klass()._layout_template == null)
						throw new Junction.IncludeError(new Error(), 'Layout not found: '+layout_path);
				}
				
				if(this.klass()._layout_template == null) {
					// finally, try the layouts/application.jst layout
					var layout_path = APPLICATION_ROOT+'app/views/layouts/application.jst';
					this.klass()._layout_template = Junction.Template.look_for_template(layout_path);
				}
				
				if(this.klass()._layout_template != null)
					result = this.render_templates(this.klass()._layout_template, false, {content_for_layout: result}, options.locals);
			}
		}
        if(result) {
            this._rendered = true;
			
			if(options.partial || (options.template && !options.update_id)  ) // return the result to be placed directly in the page
                return result;
            else { // render the result right now and return
                Junction.Framework.display_content(this.render_container_id, result);
				JITS.Event.fire_event('renderComplete')
				this._rendered_result = result;
            }
            
            
            return result;
        } else
			throw new Junction.Error(new Error(), 'nothing to render');
    },
	/**
	 * Creates and returns a closure that can be called back for asynchronous functions.
	 * Optionally call with an action and controller to specify what action should be called 
	 * when the asynchronous method returns.  Any instance variables declared in the calling
	 * action will also be available in the callback action.
	 * 
	 * 
     * @param {Object} options a set of optional parameters that define where to callback
     *      <p><ul>
     *      <li>action (string) - the name of the action to callback, defaults to the current controller without "prepare" appended.
     *      For example, if prepare_show calls continue_to without an action specified, the show action will be invoked.</li>
     *      <li>controller (string) - the controller to callback, defaults to the current controller</li>
     *      </ul></p>
	 * <p>continue_to accepts three call signatures for different types of asynchronous callbacks:
	 * <ol>
	 * <li>put_processed_in: callback will call returned function with another callback that performs processing.
	 * The results of this processing are returned to the action in the string specified by params.put_processed_in
	 * 
	 * <pre class='example'>
	 * Feed.find_events({limit: 10}, this.continue_to( {action: 'list', put_processed_in: 'all_events'} )  )</pre>
	 * <p>Feed.find_events is a wrapper for the real asynchronous call: </p>
	 * 
	 * <pre class='example'>
	 * Feed.find_events = function(params, continue_to){
	 * 	this.service.getEventsFeed(query, continue_to(this.handle_feed.bind(this)), this.handle_errors.bind(this));
	 * }</pre>
	 * <p>this.service.getEventsFeed is an asychronous call.  this.handle_feed will perform processing of the results, and then the list action will be called with 
	 * this.all_events containing the processed results.</p>
	 * <p>Callback Example:</p>
	 * <pre class='example'>
	 * list : function(params) {
	 *		this.all_events.each(function(event){ ... } ) 
	 * }</pre>
	 * </li>
	 * 
	 * 
	 * 
	 * <li>put_first_argument_in: this assumes you're calling the asynchronous method directly (without a wrapper) and passes a callback to the method 
	 * directly.  The function returned will call the specified action, assuming one argument is to be placed into the specified attribute.</li>
	 * <pre class='example'>service.getEventsFeed("http://www.google.com/calendar/feeds/jupiterits@gmail.com/public/full",
                       this.continue_to( {put_first_argument_in: 'all_events'} )</pre>
	 * <li>put_arguments_in: similar to put_first_argument_in, this assumes the asynchronous method is being called directly, and also assumes
	 * a list of several arguments is returned, placing them in the specified controller attribute and calling the specified action</li>
	 * </ol>
	 * </p>
     * @return {function} a callback function that invokes the controller action specified
	 */
	continue_to : function(params) {
		this.render({nothing: true})
		var controller = this;
		
		if(! params.action){
			if(this.action_name.startsWith('prepare_'))
				params.action = this.action_name.substring(8)
			else
				throw 'continue_to called in an action not named prepare without an action in the parameters.'
		}
		
		if(params.put_processed_in){
			return function(callback_function) { 
				return function() {
					
					var result = callback_function(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5] ) // should be done with call
					if(params.put_processed_in)
						controller[params.put_processed_in] = result
					post(params, controller);
					delete controller
				}
			}
		}else if(params.put_first_argument_in){
			return function(first_argument){
				controller[params.put_first_argument_in] = first_argument
				post(params, controller);
				delete controller
			}
			
		}else{
			return function(){
				params.put_arguments_in = params.put_arguments_in || 'results'
				controller[params.put_arguments_in] = $A(arguments)
				post(params, controller);
				delete controller
			}
		}
	},
	/**
	 * This function actually renders a template
	 * @private
	 * @param {Object} template
	 * @param {Object} is_partial
	 * @param {Object} extra_data
	 */
	render_templates : function(template, is_partial, extra_data, locals) {
		extra_data = extra_data || {};
        if(is_partial) { // return the result to be placed directly in the page
            var data = this;
			if(locals)
				Object.extend(data, locals);
		}
        else
            var data = this.prepare_template_data();
			try {
                return template.process($H(data).merge(extra_data));
			} catch(e) {
				var file_name = Junction.Error.file_name(e)
				if(file_name && file_name == 'ejs.js') {
					var message = 'Error while processing '+template.path+': '+e.message+'\n<pre><code>'+template.source.replace_angle_brackets()+'</code></pre>'
					throw new Junction.TemplateError(new Error(), message);
				} else {
					throw(e)
				}
			}
    }
}
Junction.Controller = Class.create(Junction.Controller.prototype)





Junction.Controller._layout_template = null;