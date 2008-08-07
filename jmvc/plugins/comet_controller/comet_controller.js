MVC.CometController = MVC.Class.extend(
{
    start : function(){
        this.comet = new MVC.Comet(this.domain+"/"+this.className, 
            {method: 'get', onSuccess: MVC.Function.bind(this.dispatch, this),
             parameters: this.parameters }
            )
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
                if(window[className]){
                    objects = window[className].create_many_as_existing(objects);
                }
                //now pass to controller
                //var controller = window[MVC.String.pluralize(className)+'controller']
                var controller_name = this.controller_map[className] ? this.controller_map[className] : MVC.String.pluralize(className);
                MVC.Controller.dispatch(controller_name, action, objects);
            }
        } 
    },
    controller_map :{}
},
{
    
})
