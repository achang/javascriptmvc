Filter = function(controller){
	this.params = controller.params;
}

Filter.prototype = {
	params_with : function(name) {
		var params = {};
		Object.extend(params, this.params); // get the params and update them 
		params.filter_conditions = {};
		for(var param in this.params.filter_conditions)
			params.filter_conditions[param] = this.params.filter_conditions[param];
		params.filter_conditions[name] = new view.HandlerObject('this.value');
		return params;
	},
	each_condition : function(f) {
		for(var condition in this.params.filter_conditions) {
			f(new FilterParam(condition, this.params.filter_conditions[condition]));
		};
	},
	to_sql : function() {
		var conditions = []
		this.each_condition(function(condition) {
			conditions.push(condition.full_name+" = "+condition.value_to_sql(condition))
		})
		return  conditions.join(' AND ')
	},
	get_value_for : function(name) {
		var value=null;
		if(this.params.filter_conditions && this.params.filter_conditions[name])
			var value = this.params.filter_conditions[name]
		return value;
	}
}

FilterParam = function(key, value) {
	this.full_name = key;
	this.table_name = key.split('.')[0];
	this.column_name = key.split('.')[1];
	this.value = value;
}

FilterParam.prototype = {
	get_class : function() {
		var class_name = JMVC.ActiveRecord.table_name_to_model_name(this.table_name);
		return window[class_name];
	},
	get_type : function() {
		return this.get_class().columns_hash()[this.column_name].sql_type;
	},
	value_to_sql : function() {
		var data = this.get_class().columns_hash()[this.column_name].typecast_attribute(this.value);
		return this.get_class().columns_hash()[this.column_name].to_sql(data);
	},
	is_empty : function() {
		if(this.value == '') return true;
		return false;
	},
	// primary column is an optional parameter specifying the name of the column to load for association filters
	load_default_options : function(primary_column) {
		var to_msaccess_date = function(date) {
			return [date.getFullYear(), date.getMonth()+1, date.getDate()].join('-');
		}
		if(primary_column) {
			// we know its an association
			// figure out which association it is
			for(var association_name in this.get_class().associations().belongs_to) {
				var association = this.get_class().associations().belongs_to[association_name];
				if(association.foreign_key == this.column_name)
					var matched_association = association;
			}
			var association_model = matched_association.model_name;
			var objects = window[association_model].find_by_sql('SELECT '+primary_column+', MIN(id) AS id FROM '+window[association_model].table_name()+' GROUP BY '+primary_column);
		} else {
			var objects = this.get_class().find_by_sql('SELECT '+this.column_name+', MIN(id) AS id FROM '+this.table_name+' GROUP BY '+this.column_name);
		}
		var options = [{value: '', text: ''}];
		for(var i=0; i<objects.length; i++) {
			var object = objects[i];
			if(primary_column) {
				var text = object[primary_column];
				var value = object.id;
			} else {
				var text = object[this.column_name];
				var value = text;
			}
			if(text instanceof Date) {
				text = text.toDateString();
				if(!primary_column)
					value = to_msaccess_date(value);
			}
			text = view.to_text(text)
			options.push({value: value, text: text});
		}
		return options;
	}
}


// filter_dropdown(filter, 'scans.hardware_id', {options: [{value: 5, text: 'red'}, {value: 1, text: 'green'}, {value: 3, text: 'blue'}] })
JMVC.MVC.View.filter_dropdown = function(filter, name, options){
	var fp = new FilterParam(name);
	if(options && options.representative_column) // need to load the default options
		var options = fp.load_default_options(options.representative_column);
	else if(options && options.options)
		var options = options.options;
	else
		var options = fp.load_default_options();
	return view.select_tag(name, filter.get_value_for(name), options, 
		{onchange: 'Filter.change_url('+$H(filter.params_with(name)).toJSON()+')'});
}

Filter.change_url = function(options) {
	for(var condition in options.filter_conditions) {
		var fp=new FilterParam(condition, options.filter_conditions[condition]);
		if(fp.is_empty())  delete options.filter_conditions[condition];
	}
	if($H(options.filter_conditions).keys().length == 0)  delete options.filter_conditions;
	JMVC.Routes.change_url(options);
}

JMVC.Routes.change_url = function(options) {
	window.location = window.location.pathname+"#"+JMVC.Routes.url_for(options);
}

Object.extend(Hash, {
	toQueryString: function(obj) {
		// have to convert all nested hashes to prototype hashes for the toQueryString to work correctly
		for(var option in obj) {
			if(typeof(obj[option]) == 'object' && !obj[option].length) { // is a Hash
				obj[option] = $H(obj[option])
			}
		}
	    var parts = [];
	    parts.add = arguments.callee.addPair;
		this.builder = arguments.callee.build.bind(this);
	    this.builder(obj, parts);
	    return parts.join('&');
	  }
})

Hash.toQueryString.build = function(obj, parts, context) {
  this.prototype._each.call(obj, function(pair) {
    if (!pair.key) return;
    var value = pair.value;
    
    if (value && typeof value == 'object') {
      if (Object.isArray(value)) value.each(function(value) {
        parts.add(pair.key, value, context);
      });
      if (value instanceof Hash) {
        this.builder(value, parts, (context || []).concat(pair.key));
      }
      return;
    }
    parts.add(pair.key, value, context);
  }.bind(this));
}
Hash.toQueryString.addPair = function(key, value, context) {
  var keys = context ? context.concat(key) : [key];
  key = keys.collect(function(key, index) {
    return index == 0 ? encodeURIComponent(key) : "[" + encodeURIComponent(key) + "]";
  }).join("");
   if (value === undefined) this.push(key);
   else this.push(key + '=' + (value == null ? '' : encodeURIComponent(value)));
};


JMVC.library_loaded();