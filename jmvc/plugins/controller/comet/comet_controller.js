/**
 * This class is used to 
 *    handle starting a comet response
 *    handling when there are errors
 *    dispatching the callback to other controllers for handling
 */
MVC.CometController = MVC.Controller.extend(
{
    init : function(){
         //cancels matching controller actions  
    },
    run: function(){
        var instance = new this();
        instance.run();
    },
    kill: function(){
        var instance = new this();
        instance.kill();
    },
    convert : function(response){
        return response;
    },
    dispatch : function(response){
        var responseJSON = this.convert(response);
        for(var className in response){
            //first check if something matches
            if(className == 'responseText') continue;
            var classHappenings = response[className]
            
            for(var action in classHappenings){
                var objects = classHappenings[action];
                if(this.models_map[className] != null){
                    if(this.models_map[className] != false)
                        objects = this.models_map[className].create_many_as_existing(objects);
                }else if(window[className]){
                    objects = window[className].create_many_as_existing(objects);
                }
                //now pass to controller
                //var controller = window[MVC.String.pluralize(className)+'controller']
                var controller_name = this.controller_map[className] ? this.controller_map[className] : MVC.String.pluralize(className);
                MVC.Controller.dispatch(controller_name, action, objects);
            }
        } 
    },
    controller_map :{},
    error_mode: false
},
{
    run : function(){
        this.start_polling();
    },
    start_polling : function(){
        
        this.Class._comet = new MVC.Comet(this.Class.domain+"/"+this.Class.className, 
                {method: 'get', 
                onComplete: this.continue_to('complete'),
                onSuccess: this.continue_to('success'),
                onFailure: this.continue_to('failure'),
                parameters: this.Class.parameters,
                session: this.Class.session,
                transport: this.Class.transport }
            )
    },
    failure : function(){
        this.error_mode = true;
        this.run(); //start over
    },
    success : function(response){
        this.Class.dispatch(response);
    },
    complete : function(){
        if(this.error_mode && this.restore_from_failure){
            this.restore_from_failure();
        }
        this.error_mode = false;
    },
    kill : function(){
        this.Class._comet.kill();  
    }
})
