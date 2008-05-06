MVC.CookieModel = MVC.Model.extend(
//Class functions
{
    init : function(){
          this._working = null;  
    },
    find_one : function(id){
        return this.find_class_data().instances[id];
    },
    find_all : function(){
        var insts =  this.find_class_data().instances;
        var ret = [];
        for(var i in insts)
            ret.push(insts[i]);
        return ret;
    },
    find_class_data: function(){
        if(this._working) return this._working;
    	var cd = this.find_cookie(this.className);
        if(!cd){
            this._working  ={instances: {}};
        }else{
            eval( 'this._working = ' + cd);
        }
        this._count = 0;
        for(var i in this._working.instances)
            this._count++;
        
        return this._working;
    },
    create_cookie : function(name,value,days){
    	if (days) {
    		var date = new Date();
    		date.setTime(date.getTime()+(days*24*60*60*1000));
    		var expires = "; expires="+date.toGMTString();
    	}
    	else var expires = "";
    	document.cookie = name+"="+value+expires+"; path=/";
    },
    find_cookie : function(name){
        var nameEQ = name + "=";
    	var ca = document.cookie.split(';');
    	for(var i=0;i < ca.length;i++) {
    		var c = ca[i];
    		while (c.charAt(0)==' ') c = c.substring(1,c.length);
    		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    	}
    	return null;
    },
    destroy_cookie : function(name){
        createCookie(name,"",-1);
    },
    create : function(attributes){
        var cd = this.find_class_data()
        var instances = cd.instances;
        instances[attributes[this.id]] = attributes;
        this.create_cookie(this.className, MVC.Object.to_json(cd) )
    },
    update : function(id, attributes){
        var cd = this.find_class_data()
        var instances = cd.instances;
        instances[id] = attributes;
        this.create_cookie(this.className, MVC.Object.to_json(cd) )
    },
    destroy : function(id){
        var cd = this.find_class_data();
        var instances = cd.instances;
        var attrs = instances[id];
        delete instances[id];
        this.create_cookie(this.className, MVC.Object.to_json(cd) );
        return attrs;
    }
},
// Prototype functions
{

});