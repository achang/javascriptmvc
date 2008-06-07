MVC.ModelViewHelper = MVC.Class.extend(
{
    init: function(){
        if(this.className){
            //add yourself to your model
            var modelClass;
            if(!this.className) return;
            
            if(!(this.modelClass = window[MVC.String.classize(this.className)]) ) 
                throw "ModelViewHelpers can't find class "+this.className;
            var viewClass = this;
            this.modelClass.View = function(){ return viewClass};
            this.modelClass.prototype.View = function(){
                return new viewClass(this);
            }
            
            if(this.modelClass.attributes){
                this._view = new MVC.View.Helpers({});
                var type;
                for(var attr in this.modelClass.attributes){
                    var h = this._helper(attr);
                    this.helpers[attr+"_field"] = h ;
                }
                
                
            }
        }
    },
    helpers : {},
    _helper: function(attr){
        var helper;
        switch(this.modelClass.attributes[attr].toLowerCase()) {
				case 'boolean': 
                    helper = this._view.check_box_tag;
                    break;
                case 'text':
                    helper = this._view.text_area_tag;
                    break;
				default:
					helper = this._view.text_field_tag;
					break;
	    }
        var modelh = this;
        var name = this.modelClass.className+'['+attr+']';
        var id = this.modelClass.className+'_'+attr;
        return function(){
            var args = MVC.Array.from(arguments);
            args.unshift(name);
            args[2] = args[2] || {};
            args[2].id = id;
            return helper.apply(modelh._view, args);
        }
    }
},
{
    init: function(model_instance){
        this._inst = model_instance;
        this._className = this._inst.Class.className;
    },
    element : function(){
        if(this._element) return this._element;
        this._element = MVC.$E(this.element_id());
        if(this._element) return this._element;
        this._element = document.createElement('div');
        this._element.id = this.element_id();
        this._element.className = this._className;
        this._element.setAttribute('type', this._className)
        return this._element;
    },
    element_id : function(){
        return this._className+'_'+this._inst[this._inst.Class.id]
    },
    show_errors : function(){
        var err = MVC.$E(this._className+"_error");
        var err = err || MVC.$E(this._className+"_error")
        var errs = [];
        for(var i=0; i< this._inst.errors.length; i++){
			var error = this._inst.errors[i];
			var el = MVC.$E(this._className+"_"+error[0]);
			if(el){
				el.className="error";
                var er_el = MVC.$E(this._className+"_"+error[0]+"_error" );
				if(er_el) er_el.innerHTML = error[1];
			}
			else
                errs.push(error[0]+' is '+error[1]);
            
		}
        if(errs.length > 0){
             if(err) err.innerHTML = errs.join(", "); 
             else alert(errs.join(", "));
        }
    },
    clear_errors: function(){
        var p;
        var cn = this._className
        for(var i =0; i < this._inst._properties.length; i++){
            p = this._inst._properties[i];
            var el = MVC.$E(cn+"_"+p)
            if(el) el.className = el.className.replace(/(^|\\s+)error(\\s+|$)/, ' '); //from prototype
            var er_el = MVC.$E(cn+"_"+p+"_error" );
		    if(er_el) er_el.innerHTML = '&nbsp;';
        }
        var bigel = MVC.$E(cn+"_error");
        if(bigel) bigel.innerHTML = '';
    }
}
)