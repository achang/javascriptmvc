if(typeof Object == 'undefined' || typeof Object.extent == 'undefined' )
{
	if(typeof Object == 'undefined') Object = {}
	Object.extend = function(destination, source) {
	  for (var property in source) {
	    destination[property] = source[property];
	  }
	  return destination;
	};
}


Sorter = function(controller){
	this.params = controller.params
	//alert(this.params.sort+' , '+ decodeURIComponent(this.params.sort))
	
}
Sorter.prototype = {
	params_with : function(name, direction){
		var params = {};
		Object.extend(params, this.params); // get the params and update them 
		var sp = new SortParam(params.sort);
		sp.update(name, direction)
		params.sort = sp.toString();
		return params
	},
	sorting_direction : function(name){
		var params = {};
		Object.extend(params, this.params); // get the params and update them 
		var sp = new SortParam(params.sort);
		return sp.direction_for(name)
	},
	each_sort_and_direction : function(f){
		var params = {};
		Object.extend(params, this.params); // get the params and update them 
		var sp = new SortParam(params.sort);
		return sp.each(f)
	},
	is_first : function(name) {
		var params = {};
		Object.extend(params, this.params); // get the params and update them 
		var sp = new SortParam(params.sort);
		return sp.is_first(name)
	},
	to_sql : function(){
		var order = []
		this.each_sort_and_direction(function(sort, direction){
			order.push( sort + ' '+direction)
		})
		return  order.join(', ')
	}
}

// sort=hardware,DESC;
SortParam = function(value) {
	//alert('creating with:'+value)
	if(value)
		this.parts = decodeURIComponent(value).split(';')
	else
		this.parts = []
}
SortParam.prototype = {
	names : function(){
		this.parts.collect(function(part){return part.split(',')[0]  })
	},
	pair_for : function(name){
		for(var i = 0; i < this.parts.length; i ++){
			pieces = this.parts[i].split('-')
				if(pieces[0] == name) return this.parts[i];
		};
		return null;
	},
	direction_for : function(name){
		var pair = this.pair_for(name)
		if(!pair) return null;
		return pair.split('-')[1]
	},
	update : function(name, direction){
		for(var i = 0; i < this.parts.length; i ++){
			pieces = this.parts[i].split('-')
				if(pieces[0] == name){
					this.parts.splice(i, 1)
					//this.parts[i] = name+'-'+direction;
					//return
				}
		};
		this.parts.unshift(name+'-'+direction)
	},
	toString : function(){
		return this.parts.join(';')
	},
	each : function(f) {
		for(var i = 0; i < this.parts.length; i ++){
			pieces = this.parts[i].split('-')
			f(pieces[0],pieces[1])
		};
	},
	is_first: function(name){
		if(this.parts.length == 0) return false;
		if(this.parts[0].split('-')[0] == name ) return true;
		return false;
	}
}

JMVC.MVC.View.sorter_link = function(sorter, name, title){
	title = title || name;
	if( title.include('.') ) {
		var parts = name.split('.')
		title = parts[0].singularize().capitalize()+' '+parts[1].capitalize()
	}
	
	var direction = sorter.sorting_direction(name)
	
	
	if(! direction )
		return JMVC.MVC.View.link_to(title, sorter.params_with(name, "ASC")  )
	else if( direction ==  'DESC'  )
		return (sorter.is_first(name)? '&#x25B3;' : '&#x25B4;')+JMVC.MVC.View.link_to(title, sorter.params_with(name, "ASC")  )
	else
		return (sorter.is_first(name)? '&#x25BC;' : '&#x25BF;')+JMVC.MVC.View.link_to(title, sorter.params_with(name, "DESC")  )
}



JMVC.library_loaded()