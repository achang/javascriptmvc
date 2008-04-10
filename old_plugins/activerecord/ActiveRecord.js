/**
 * @fileoverview
 * The ActiveRecord.js file contains an Javascript implementation of the 
 * active record design pattern and supporting functionality.
 * <p class='credits'>JavaScript MVC based off <a href='http://trimpath.com/'>TrimJunction framework</a>.
 * @author Jupiter Information Technology Solutions - Brian Moschel, Justin Meyer.<br/>
 * @version 0.1
 */
 
/**
 * Generates an ActiveRecord model.
 * @constructor
 * @class
 * <pre>Example:
 *      Examples = Class.create(JMVC.ActiveRecordGenerator('Examples'), {.....} )
 * </pre>
 */
JMVC.ActiveRecordGenerator = function(model_name) {
	window[model_name] = Class.create(JMVC.ActiveRecord, {klass_name: model_name});
	window[model_name]
	window[model_name].pending_belongs_to = [];
	window[model_name].pending_has_many = [];
	window[model_name]._associations = {belongs_to: {}, has_many: {}};
	window[model_name].klass_name = model_name;
	//window[model_name].prototype.klass=window[model_name] TODO: change later
    var find_table_in_schema = function(table_name) {
        if(JMVC.app_schema) {
            for (var i=0; i<JMVC.app_schema.tables.length; i++) {
                var table = JMVC.app_schema.tables[i];
                if(table.name == table_name)
                    return table;
            }
        }
        return null;
    }
	
	// used to determine the correct table name for each model
	// checks to make sure the table name is valid within the schema
	// if no valid table can be found, throws an error
	// returns the table object from the schema
	var lookup_table = function(model_name) {
		// was the table_name set with set_table_name
		for(var table_name in JMVC.ActiveRecord.table_names_hash) {
			if(JMVC.ActiveRecord.table_names_hash[table_name] == model_name) {
				var table_object = find_table_in_schema(table_name);
				if(table_object) return table_object;
			}
		}
		// if still not found, use the default mapping
		// Thing --> things
		var table_name = model_name.pluralize().uncapitalize();
		var table_object = find_table_in_schema(table_name);
		if(table_object) {
			JMVC.ActiveRecord.table_names_hash[table_name] = model_name;
			return table_object;
		}
		// Thing --> Things
		var table_name = model_name.pluralize();
		var table_object = find_table_in_schema(table_name);
		if(table_object) {
			JMVC.ActiveRecord.table_names_hash[table_name] = model_name;
			return table_object;
		}
		
		// Thing --> Thing
		var table_name = model_name;
		var table_object = find_table_in_schema(table_name);
		if(table_object) {
			JMVC.ActiveRecord.table_names_hash[table_name] = model_name;
			return table_object;
		}
		
		// Thing --> thing
		var table_name = model_name.uncapitalize();
		var table_object = find_table_in_schema(table_name);
		if(table_object) {
			JMVC.ActiveRecord.table_names_hash[table_name] = model_name;
			return table_object;
		}
		
		// can't find the correct table_name
		throw new JMVC.Error(new Error(), 'Model not found in the application schema: '+model_name);
	}
	
	// delay setting up the columns_hash and table_name until after all set_table_name and set_primary_keys have been called
	var generate_columns_hash = function() {
		var table_object = lookup_table(model_name);
	    var columns_hash = {};
	    for (var j=0; j<table_object.columns.length; j++) {
	        var column = table_object.columns[j];
	        columns_hash[column.name] = new JMVC.ColumnController(column.name, column.type, column['null'])
	    }
		window[model_name].table_name = function() {
			return table_object.name;	
		}
		window[model_name].columns_hash = function() {
			return columns_hash;	
		}
	}
	JMVC.JMVC_startup_tasks.push(generate_columns_hash);
	return window[model_name];
}
/**
 * Column Controller
 * @param {Object} name
 * @param {Object} sql_type
 * @param {Object} is_null
 * @param {Object} default_value
 */
JMVC.ColumnController = function(name, sql_type, is_null, default_value) {
	return new JMVC[sql_type.capitalize()+'Column'](name, sql_type, is_null, default_value)
}


JMVC.Column = function() {}
JMVC.Column = Class.create( 
JMVC.Column.prototype = {
	initialize: function(name, sql_type, is_null, default_value) {
		this.name = name;
		this.default_value = default_value || null;
		this.sql_type = sql_type || null;
		this.is_null = is_null;
		if(is_null == null)
			this.is_null = false;
		this.is_primary = false;
	},
	human_name: function() {
		var name_arr = this.name.split('_')
		name_arr = name_arr.collect(function(name){ return name.capitalize(); });
		return name_arr.join('')
	},
	typecast_attribute: function(value) {
		return value;
	},
	to_sql: function(value) {
		return "'"+value+"'";
	},
	toString : function() {
		return '<JMVC.Column #'+this.name+'>'	
	},
	inspect : function() {
		return 'JMVC.Column: name='+this.name+', sql_type='+this.sql_type+', is_null='+this.is_null
	}
} 
)

/**
 * @class
 */
JMVC.StringTextColumn = function(){}
JMVC.StringTextColumn = Class.create(JMVC.Column, {
	to_sql: function(value) {
		if(JMVC.database_adapter == 'msaccess') {
			return "'"+value.replace(/'/g, "\'\'").replace(/"/g, "\\\"")+"'";
		} else {
			return "'"+value.replace(/'/g, "\\\'").replace(/"/g, "\\\"")+"'";
		}
	}
})

/**
 * @class
 */
JMVC.StringColumn = function(){}
JMVC.StringColumn = Class.create(JMVC.StringTextColumn)

/**
 * @class
 */
JMVC.TextColumn = function(){}
JMVC.TextColumn = Class.create(JMVC.StringTextColumn)

/**
 * @class
 */
JMVC.IntegerColumn = function(){}
JMVC.IntegerColumn = Class.create(JMVC.Column, {
	typecast_attribute: function(value) {
		return (isNaN(parseInt(value, 10))? null: parseInt(value, 10));
	},
	to_sql: function(value) {
		return value;
	}
})
/**
 * @class
 */
JMVC.DecimalColumn = function(){}
JMVC.DecimalColumn = Class.create(JMVC.IntegerColumn, {
	typecast_attribute: function(value) {
		return (isNaN(parseFloat(value, 10))? null: parseFloat(value, 10));
	}
})
/**
 * @class
 */
JMVC.DatetimeColumn = function(){}
JMVC.DatetimeColumn = Class.create(JMVC.Column, {
	typecast_attribute: function(value) {
		if(typeof value == 'string')
			return Date.from_sql(value)
		if(value instanceof Date)
			return value
		return new Date(value.year,value.month, value.day)
	},
	to_sql: function(value) {
		if(JMVC.database_adapter == 'msaccess') {
			return "#"+value.to_sql()+"#";
		}
		return "'"+value.to_sql()+"'";
		
	}
})
/**
 * @class
 */
JMVC.DateColumn = function(){}
JMVC.DateColumn = Class.create(JMVC.DatetimeColumn)
/**
 * @class
 */
JMVC.BooleanColumn = function(){}
JMVC.BooleanColumn = Class.create(JMVC.Column,{
	typecast_attribute: function(value) {
		return value
	},
	to_sql: function(value) {
		return (value == null ? null : (value ? 1 : 0) );
	}
})

/**
 * ActiveRecord instances are created with new_instance.
 * <pre class='example'>
 * task = Task.new_instance( {title: <span>"Mow Grass"</span>, description: <span>"1. Fill with gas.\n2. Start.\n3. Mow"</span> } )</pre>
 * @constructor
 * @class
 * <p>JMVC.ActiveRecord is based on the active record design pattern where a database table is wrapped into a
 * class.  An object instance is tied to a single row in the table.
 * JMVC.ActiveRecord objects don‘t specify their attributes directly, 
 * but rather infer them from the table definition with which they‘re linked. 
 * Adding, removing, and changing attributes and their type is done directly in the DatabaseBuilder. 
 * Any change is instantly reflected in the JMVC.ActiveRecord objects. </p>
 * 
 * <h4>Definition</h4>
 * <p>Example class that inherits functionality from JMVC.ActiveRecord:</p>
 * <pre class='example'>
 *  Task = Class.inherit(JMVC.ActiveRecordGenerator('Task'), {  
 *      //add class methods here
 *  });</pre>
 * 
 * <h4>Creation</h4>
 * <p>JMVC.ActiveRecord accepts constructor parameters as a hash:</p>
 * <pre class='example'>
 * task = Task.new_instance( {title: <span>"Mow Grass"</span>, description: <span>"1. Fill with gas.\n2. Start.\n3. Mow"</span> } )</pre>
 *
 * <p>Alternatively, you can change attributes with accessor methods, or by setting the attributes themselves:</p>
 * <pre class='example'>
 * task = Task.new_instance()
 * task.title ="Mow Grass"
 * task.description = "1. Fill with gas.\n2. Start.\n3. Mow"</pre>
 *
 * <p>Finally, you must save the object to the client and back to the server.  To update the record:</p>
 * <pre class='example'>
 * task.save()</pre>
 *
 * <h4>Retrieving Data</h4>
 * To retrieve records from the server database:
 * <pre class='example'>var tasks = Task.find('all');</pre>
 * <p>This saves an array of Task objects in tasks.  It also populates the client database with the
 * same data.
 * @see JMVC.MVC.View
 * @see JMVC.Controller
 */
JMVC.ActiveRecord = function(){}
JMVC.ActiveRecord.prototype = {
    /**
     * Returns the object as JSON.  The function packages up all attributes.
     * @return {Object} the JSON object.
     */
    attributes : function() {
        var attributes = {};
		for(var i=0; i<this.klass().column_names().length; i++) {
			var column_name = this.klass().column_names()[i];
			attributes[column_name] = this[column_name];
		}
		return attributes;
    },
	
	
	
    /**
     * Deletes the object's record from the database.
     * <pre class='example'>
     * var success = my_record.destroy()
	 * </pre>
     * @returns {Boolean} true if the operation was performed successfully, false if otherwise.
     */
    destroy : function(options) {
        var options = options || {};
		var destroy_template = new Template('DELETE #{table} FROM #{table} WHERE #{table}.#{primary_key} = #{primary_value}');
		var template_data = {table: this.klass().table_name(), primary_key: 'id', primary_value: this.id };
        return JMVC.QueryController.send(destroy_template.evaluate(template_data));
    },
    
	
	/**
	 * Called on the creation of a new instance.  This is called when the class method new_instance is called.
	 * This takes on optional attributes hash to instantiate the object's properties.
	 * Attributes and values are copied from the object parameter to the new instance.  
	 * <p>Example:
	 * <pre class='example'>
	 * var task = Task.new_instance({name: 'Save the World'} )
	 * task.name
	 *             => 'Save the world'</pre>
	 * @param {Object} attributes object whose attributes get copied to the new instance.
	 * @return {JMVC.ActiveRecord}
	 */
    initialize : function(attributes) {
		// Initializes the attributes array with keys matching the columns from the linked table and
		// the values matching the corresponding default value of that column, so
		// that a new instance, or one populated from a passed-in Hash, still has all the attributes
		// that instances loaded from the database would.
		var attributes_from_column_definition = function() {
			return this.klass().columns().inject({}, function(attributes, column) {
				if(column.name != 'id')
					attributes[column.name] = column.default_value;
				return attributes;
			})
		}.bind(this)
		var default_attrs = attributes_from_column_definition();
		for(var attribute in default_attrs) {
			this[attribute] = default_attrs[attribute];
		}
		if(attributes && typeof(attributes)=='object')
			for(var attribute in attributes) {
				if(typeof this[attribute] != 'undefined' || attribute == 'id')
					this[attribute] = this.klass().typecast_attribute(attributes[attribute], this.klass().columns_hash()[attribute]);
				else
					throw(new JMVC.Error(new Error(), 'unrecognized attribute '+attribute+' for model '+this.klass_name))
			}
		else if(attributes && typeof(attributes)=='function')
			attributes(this);
		this.new_record = ((this.id != null && this.id > 0)? false: true);
		return this;
	},
	
	/**
     * Returns if the object has been saved to the client or server database.
	 * Objects that haven't
     * been saved to either database have a null id or zero id.
     * @return {Boolean} true if the object hasn't been saved to the client or server database.
     */
    is_new_record : function() {
        return this.new_record;
    },
    
	
	/**
     * Returns the instance's class.
     * @return {Class} the class for the given instance
     */
    klass : function(){
        if(this.klass_name)
            return window[this.klass_name];
    },
	/**
     * Creates or updates the object's database record.
     * @return {Boolean} true if the save was successful, false if otherwise.
     */
    save : function(request_params) {
		// returns a datetime string in the format a sql database requires
		var convert_javascript_date_to_sql_date = function(d) {
            var sql_date_array = [d.getFullYear(), '-', (d.getMonth()+1), '-', d.getDate(), ' ', d.getHours(), ':', d.getMinutes(), 
                ':', d.getSeconds()];
            return sql_date_array.join('');
		}
		// Returns a comma-separated pair list, like "key1 = val1, key2 = val2"
		var quoted_comma_pair_list = function(hash) {
			var list = [];
			return $H(hash).inject([], function(list, pair) {
				if(JMVC.database_adapter == 'msaccess')
					list.push(['[',pair.key,']', '=', pair.value.toString()].join(''));
				else
					list.push(['',pair.key,'', '=', pair.value.toString()].join(''));
				return list;
			}).join(",")
		}
		
		// Returns copy of the attributes hash where all the values have been safely quoted for use in
		// an SQL statement.
		var attributes_with_quotes = function(include_primary_key) {
			if(include_primary_key == null)
				include_primary_key = true;
			return $H(this.attributes()).inject({}, function(quoted, attr){
				var name = attr.key;
				var value = attr.value;
				var column = this.klass().columns_hash()[name];
				if(column) {
					if(!(include_primary_key == false && column.name == 'id'))
						quoted[name] = quote_value(value, column); // unless !include_primary_key && column.primary
				}
				return quoted;
			}.bind(this))
		}.bind(this)
		// formats AR data for insertion into an SQL string
		// calls to_sql on each column
		var quote_value = function(value, column) {
			var col = this.klass().columns_hash()[name];
			if(value == null)
				return 'NULL';
			return column.to_sql(value);
		}.bind(this)
		var quoted_column_names = function(include_primary_key) {
			if(include_primary_key == null)
				include_primary_key = true;
			col_names_arr = [];
			$A(this.klass().column_names()).each(function(c){
				if(!(include_primary_key == false && c == 'id'))
				{
					if(JMVC.database_adapter == 'msaccess')
						col_names_arr.push('['+c+']')
					else
						col_names_arr.push(''+c+'')
				}
			})
			return col_names_arr;
		}.bind(this)
		request_params = request_params || {}
        
		var updated_at_column = this.klass().columns_hash()['updated_at'] instanceof JMVC.DatetimeColumn;
		var created_at_column = this.klass().columns_hash()['created_at'] instanceof JMVC.DatetimeColumn;
		
		if(this.is_new_record() && this.id) {  // do a literal insertion
			var insert_template = new Template('INSERT INTO #{table} (#{cols}) VALUES (#{values})');
			var template_data = {table: this.klass().table_name(), cols: quoted_column_names(true).join(','), 
								values: $H(attributes_with_quotes(true)).values().join(',')};
            return JMVC.QueryController.send(insert_template.evaluate(template_data), request_params || {});
		}
		else if(this.is_new_record()) {
			if(updated_at_column)
				this.updated_at = new Date();
			if(created_at_column)
				this.created_at = new Date();
			var insert_template = new Template('INSERT INTO #{table} (#{cols}) VALUES (#{values})');
			var template_data = {table: this.klass().table_name(), cols: quoted_column_names(false).join(','), 
								values: $H(attributes_with_quotes(false)).values().join(',')};
			
			request_params.callback = function(new_id) {
				this.id = new_id;
				this.new_record = false;
				return new_id;
			}.bind(this)
            return JMVC.QueryController.send(insert_template.evaluate(template_data), request_params || {});
		} else {
			if(updated_at_column)
				this.updated_at = new Date();
			var update_template = new Template('UPDATE #{table} SET #{pair_list} WHERE #{table}.#{primary_key} = #{primary_value}');
			var template_data = {table: this.klass().table_name(), primary_key: 'id', primary_value: this.id, 
								pair_list: quoted_comma_pair_list(attributes_with_quotes(false)) };
								
            return JMVC.QueryController.send(update_template.evaluate(template_data), request_params || {});
		}
    },
	
	/**
     * Updates the attributes for an object.  This also updates the database.
     * @return {Object,Boolean} the attributes if the save was successful, false if otherwise.
     * @throws Exception 'unrecognized attribute for model'
     */
	update_attributes : function(attributes, request_params) {
			
		if(attributes)
			for(var attribute in attributes) {
				if(typeof this[attribute] != 'undefined' || attribute == 'id')
					this[attribute] = this.klass().typecast_attribute(attributes[attribute], this.klass().columns_hash()[attribute]);
				else
					throw(new JMVC.Error(new Error(), 'unrecognized attribute '+attribute+' for model '+this.klass_name))
			}
		this.save(request_params);
		return attributes;
	},
    
	/**
     * Returns a string representation of the object.
     * @return {String} the attributes if the save was successful, false if otherwise.
     */
	toString: function() {
		return '#<'+this.klass_name+':'+(this.is_new_record()? 'No ID': this.id)+'>';
	}
}
JMVC.ActiveRecord = Class.create(JMVC.ActiveRecord.prototype);

// ----------------------------------------- Static Methods -----------------------------------------



/**
 * Returns the full column name with a table prefix.
 * <p>Example:</p>
 * <pre>
 * JMVC.ActiveRecord._sql_column_name('name') => 'employees.name'
 * </pre>
 * @private
 * @param {Object} name
 */
JMVC.ActiveRecord._sql_column_name = function(name) {
	if(name.split(/\./).length==1)
        return this.klass().table_name()+'.'+name;
	return name
}

/**
 * Returns the model's associations.
 */
JMVC.ActiveRecord.associations = function() {
	if(JMVC.ActiveRecord._associations_are_setup == false) {
		JMVC.ActiveRecord.setup_associations();
	}
	return this._associations;
}

/**
 * Creates a belongs to association.
 *
 * <p>This adds the association as a function to instances of the model.
 * <p>Example:
 * <pre class='example'>
 * Expense.belongs_to('task', {model_name: <span/>'Task', foreign_key: <span/>'task_id'})</pre>
 * @param {String} association_name The function name representing this association.
 * @param {Object} info hash with the following attributes:
 *      <ul>
 *          <li>model_name {String} - The name of the model you are creating an association with.  Ex: 'Task' </li>
 *          <li>foreign_key {String} - The name of the column you are creating this association with.  Ex: 'relatedTask_id' </li>
 *      </ul>
 */
JMVC.ActiveRecord.belongs_to = function(association_name, info) {
	this.klass().pending_belongs_to.push({association_name: association_name, info: info});
	this.prototype[association_name] = function(params) {
		JMVC.ActiveRecord.setup_associations();
		return this[association_name](params);
	}
}


/**
 * Returns an array of column names.
 * <p>Example:
 * <pre class='example'>
 * Computer.column_names() => ['id','ip_address','user']</pre>
 * @return {Array} Array of column names.
 */
JMVC.ActiveRecord.column_names = function() {
    return this.columns().map(function(c){ return c.name });
}
/**
 * Returns an array of columns.
 * <p>Example:
 * <pre class='example'>
 * Computer.columns() => [JMVC.Column #id, JMVC.Column #ip_address, JMVC.Column #user]</pre>
 * @return {Array} Array of column names.
 */
JMVC.ActiveRecord.columns = function() {
	return $H(this.columns_hash()).values();
}

/**
 * Returns an array of columns that are not named id or end with _id.
 * <p>Example:
 * <pre class='example'>
 * Computer.content_columns() => [JMVC.Column #ip_address, JMVC.Column #user]</pre>
 * @return {Array} Array of column names.
 */
JMVC.ActiveRecord.content_columns = function() {
	return this.columns().reject(function(c){ return c.name == 'id' || c.name.endsWith('_id') });
}



/**
 * Counts the number of items that match the arguments.
 * @param {Object} params
 * @return {Integer} the number of elements found.
*/
JMVC.ActiveRecord.count = function(params) {
	params = params || {};
    var sql_query_array = ['SELECT COUNT(*)'];
    sql_query_array.push( this.process_includes_conditions(params.include, params.conditions) );
    var sql = sql_query_array.join(' ');
    
    if(params.no_send && params.no_send == true)
        return {sql: sql, params: params};
    return JMVC.QueryController.send(sql, params);
}

/**
 * Creates a new instance and saves it to the client database.
 * <p>Example:</p>
 * <pre class='example'>
 * Computer.create( {ip_address: '127.0.0.1', user: 'hank'} ) => #&lt;Computer:1></pre>
 * @return {Boolean/Object} Returns the created object if save was successful, false if otherwise.
 */
JMVC.ActiveRecord.create = function(object, params) {
    var new_object = new this(object);
	new_object.new_record = true;
    if(! new_object.save(params)) return false;
    return new_object;
}
/**
 * Aliases table and column names.
 * @private
 * @param {Array} an array of model names. 
 */
JMVC.ActiveRecord.create_alias = function(from_models) {
	var sql_arr = [];
	var create_aliased_table_map = function(model_names) {
		var alias_table_map = {};
		for(var i=0; i<model_names.length; i++) {
			var model_name = model_names[i];
			alias_table_map[model_name] = {};
			for(var j=0; j<window[model_name].column_names().length; j++) {
				var column_name = window[model_name].column_names()[j];
				alias_table_map[model_name][column_name] = 't'+i+'_'+'c'+j;
			}
		}
		return alias_table_map;
	}
	
	var generate_alias_sql = function(alias_table_map) {
		var alias_sql_arr = [];
		for(var model_name in alias_table_map) {
			for(var column_name in alias_table_map[model_name]) {
				alias_sql_arr.push(window[model_name].table_name()+'.'+column_name+' AS '+alias_table_map[model_name][column_name]);
			}
		}
		return alias_sql_arr.join(', ');
	}
	
	// create the table alias mapping data
	var alias_table_map = create_aliased_table_map(from_models);
	
	// use the table alias mapping data to generate sql
	var alias_sql = generate_alias_sql(alias_table_map)
	sql_arr.push(alias_sql);
	return sql_arr.join(' ');
}
/**
 * Creates a belong to association.  This is the real function that adds the association function to the classes
 * prototype.  This is called after all the models have been loaded.
 * @private
 * @param {Object} association_name
 * @param {Object} info
 */
JMVC.ActiveRecord.create_belongs_to = function(association_name, info) { 
	if(!info) {
		info = {};
		info.model_name = association_name.capitalize();
		info.foreign_key = association_name+'_id';
	}
	if(!(this.columns_hash()[info.foreign_key]
		&& this.columns_hash()[info.foreign_key] instanceof JMVC.IntegerColumn)) {
			throw(new JMVC.Error(new Error(), 'Foreign Key must be an integer type'));
	}
	this.klass()._associations.belongs_to[association_name] = info;
    this.prototype[association_name] = function(params) {
		params = params || {};
		params.force_remote = false;
        var parent_model = window[info.model_name];
		if(this[info.foreign_key])
	        return parent_model.find(this[info.foreign_key], params)
		return null;
    }
}

/**
 * Creates a has many association.  This is the real function that adds the association function to the classes
 * prototype.  This is called after all the models have been loaded.
 * @private
 * @param {Object} plural_association_name
 * @param {Object} info
 */
JMVC.ActiveRecord.create_has_many = function(plural_association_name, info) {
	if(!info) {
		info = {};
		info.model_name = plural_association_name.singularize().capitalize();
		info.foreign_key = this.table_name().singularize()+'_id';
	}
	this.klass()._associations.has_many[plural_association_name] = info;
	if(!(window[info.model_name].columns_hash()[info.foreign_key] 
		&& window[info.model_name].columns_hash()[info.foreign_key] instanceof JMVC.IntegerColumn)) {
			throw(new JMVC.Error(new Error(), 'Foreign Key must be an integer type'));	
	}
    this.prototype[plural_association_name] = function(params) {
		params = params || {};
		params.force_remote = false;
        var child_model = window[info.model_name];
        var conditions = info.foreign_key + " = " + this.id;
		if(params.conditions)
			params.conditions = params.conditions+' AND '+conditions;
		else
			params.conditions = conditions;
        return child_model.find('all', params );
    }
}

/**
 * Destroys the record with the given id by instantiating the object and calling destroy (all the callbacks are the triggered). 
 * If an array of ids is provided, all of them are destroyed.
 * @param {Object} id - the id of the object
 * @returns true if successfull.
 * @throws 'Error destroying object with id'
 */
JMVC.ActiveRecord.destroy = function(id) {
	if(typeof(id) == 'object') {
		id.each(function(id) {
			if(! this.destroy(id))
				throw 'Error destroying object with id: '+id;
		}.bind(this))
		return true;
	} else
		return this.find(id).destroy();
}

/**
 * Destroys objects that match the given condition.  If not condition is present, it will destory all records.
 * <p>Example</p>
 * <pre class='example'>Installation.destroy_all("date < '2004-04-04'")</pre>
 * @param {String} conditions SQL condition string
 */
JMVC.ActiveRecord.destroy_all = function(conditions) {
	conditions = conditions || null;
	this.find('all', {conditions: conditions}).each(function(object) { object.destroy() })
}

/**
 * Returns true if the given +id+ represents the primary key of a record in the database, false otherwise.
 * You can also pass a set of SQL conditions. 
 * <p>Examples:</p>
 * <pre class='example'>
 * Person.exists(5)
 * Person.exists('5')
 * Person.exists({name: "David"})
 * Person.exists('name = "Brian"'})</pre>
 * @param {Object} id_or_conditions
 */
JMVC.ActiveRecord.exists = function(id_or_conditions) {
	// Interpret Array and Hash as conditions and anything else as an id.
	var expand_id_conditions = function(id_or_conditions) {
		if(typeof(id_or_conditions) == 'object')
			return id_or_conditions;
		if(parseInt(id_or_conditions,10).toString() == id_or_conditions.toString())
			return this.process_conditions('id = '+id_or_conditions);
		return this.process_conditions(id_or_conditions);
	}.bind(this)
	// TODO change this to find('first') once limit (and thus first) is implemented
	var results = this.find('all', {conditions: expand_id_conditions(id_or_conditions)});
	return ((results.length == 0)? false: true);
}


/**
 * Finds and returns ActiveRecord objects.
 * <p>Example:
 * <pre class='example'>
 * var tasks = Task.find('all', {limit: 20} )</pre>
 * - returns an array up to 20 tasks.
 * @param {String/Integer} type an id, 'first', or 'all'
 * @param {Object} params Optional hash with the following optional attributes:
 *  <table class='params_table'>
 *      <tr><th>Attribute</th><th>Value</th></tr>
 *      <tr><td>include:</td><td>Names associations that should be loaded alongside using LEFT OUTER JOINs. The 
 *              symbols named refer to already defined associations.  'all' will load all associations.
 *              'belongs_to' will load just the belongs_to associations and 'has_many' just the has_manys.</tr>
 *      <tr><td>conditions: </td><td>String of sql conditions.</td></tr>
 *      <tr><td>limit:</td><td>Integer limit of records to return.</td></tr>
 *      <tr><td>offset:</td><td>Start returning records after this number.</td></tr>
 *      <tr><td>order:</td><td>String describing how to order records.  Ex: "updated_at DESC"</td></tr>
 *  </table>
 * @return {JMVC.Request} an array of objects of the requesting class.
 */
JMVC.ActiveRecord.find = function(type, params) {

    var params = params || {};
	
    if(typeof type == 'number' || parseInt(type).toString() == type) {
        if(params.conditions)
            params.conditions += ' AND id = '+type;
        else
            params.conditions = 'id = '+type;
    }
	
	if(params.include && typeof(params.include) == 'string')
		params.include = [params.include];
    
	var find_params = {};
	find_params.type = type;
	find_params.include = params.include;
	
    var sql_query_array = ['SELECT'];
	if(JMVC.database_adapter == 'msaccess') {
		sql_query_array.push( this.process_limit_offset(params.limit, params.offset) );
	}
    var includes_conditions_sql = this.process_includes_conditions(params.include, params.conditions, find_params);
	sql_query_array.push(this.create_alias(find_params.from_models));
	sql_query_array.push(includes_conditions_sql);
    sql_query_array.push( this.process_order(params.order) );
    if(JMVC.database_adapter != 'msaccess') {
		sql_query_array.push( this.process_limit_offset(params.limit, params.offset) );
	}
    
    return this.find_by_sql( sql_query_array.join(' '), params, find_params);
}

/**
 * Works like find(:all), but requires a complete SQL string.
 * @param {Object} sql
 * @param {Object} params
 * @param {Object} find_params
 */
JMVC.ActiveRecord.find_by_sql = function(sql, params, find_params) {
	find_params = find_params || {};
	params = params || {};
	params.callback = this.process_find_results(find_params);
    if(params.no_send)
        return {sql: sql, params: params};
    return JMVC.QueryController.send(sql, params);
}

JMVC.ActiveRecord.packaged_find = function(type, params) {
	params = params || {};
	params.no_send = true;
	return this.find(type, params)
}

/**
 * Creates a has many association.  
 *
 * <p>This adds the association as a function to the model's prototype.  Has many associations
 * cache to prevent extra client database lookups.  Passing true to the association will
 * reload the association cache.
 * <p>Example:
 * <pre class='example'>
 * Task.has_many('expenses', {model_name: <span/>'Expense', foreign_key: <span/>'task_id'})</pre>
 * 
 * @param {String} association_name The function name representing this association.
 * @param {Object} info optional hash with the following attributes:
 *  <table class='params_table'>
 *      <tr><th>Attribute</th><th>Value</th></tr>
 *      <tr><td>model_name: {String}</td>
 *      	<td>The name of the model you are creating an association with. This
 *      		defaults to the singlular, capitalized name of the association name (Expense).
 *      	</td>
 *      </tr>
 *      <tr><td>foreign_key {String}</td><td>The name of the associated table's 
 *      		column you are creating this association with.
 *      		By default this is guessed to be the name of this class in lower-case and "_id" suffixed.  For example, expenses's task_id column.
 *      </td></tr>
 *  </table>
 */
JMVC.ActiveRecord.has_many = function(association_name, info) {
	this.klass().pending_has_many.push({association_name: association_name, info: info});
	this.prototype[association_name] = function(params) {
		JMVC.ActiveRecord.setup_associations();
		return this[association_name](params);
	}
}
/**
 * Used for introspection, returns the class of the instance called on.
 * @return {Class} the class for the given instance
 */
JMVC.ActiveRecord.klass = function(){
    if(this.klass_name)
        return window[this.klass_name];
}
/**
 * Loads ActiveRecord classes from the database schema.
 * @private
 * @param {Object} schema_source
 */
JMVC.ActiveRecord.load_from_schema = function(schema_source) {
    if(!schema_source || !APPLICATION_ROOT) 
		throw new JMVC.Error(new Error(), 'schema_source or APPLICATION_ROOT not defined');
	var response = new MVC.Ajax.Request(schema_source, {asynchronous: false, method: "get"});
    eval('var applicationinfo = '+response.transport.responseText);
    JMVC.app_schema = applicationinfo;
    for (var i=0; i<JMVC.app_schema.tables.length; i++) {
		var file_name = JMVC.ActiveRecord.table_name_to_model_name(JMVC.app_schema.tables[i].name).uncapitalize();
		try {
	        include(MVC.JFile.join(APPLICATION_ROOT, "app", "models", file_name+".js"), {cache: (JMVC.ENV.ENVIRONMENT == 'development' ? false : true)  });
		} catch(e) {} // swallow any errors here in case of weird table names that will be set with set_table_name
    }
}

/**
 * This isn't really used for anything right now.  However, it could be used to create conditions from
 * arrays or objects.
 * @private
 * @param {Object} conditions
 */
// 
JMVC.ActiveRecord.process_conditions = function(conditions) {
    if(conditions) {
        var elements_array = conditions.split(/\s*(>=|<=|!=|=|<|>)\s*/i);
		elements_array = elements_array.collect(function(element) {
			return element.split(/\s+(BETWEEN|LIKE|AND|OR)\s+/i);
		}).flatten();
        var i=0;
        while(i<elements_array.length) {
            elements_array[i] = this._sql_column_name(elements_array[i])
            var operator = elements_array[i+1];
            if(operator.match(/BETWEEN/))
                i+=6;
            else
                i+=4;
        }
        return elements_array.join(' ');
    }
    return '';
}

/**
 * Returns an function that builds active record objects from the objects_hash.
 * @private
 * @param {Object} find_params
 */
/*
 * [store, store, item, item, customer, customer]
 * 
 * {Store: [store1, store2], Item: [item2, item3], Customer: [customer1, customer2]}
 * build hash
 *   objects_hash - all objects
 *   return_objects - array of objects to return
 * go through build recursive function
 *   cache - function
 * call a process_association type function with association name and parent_model_name
 *   cache_association
 * this goes through all the objects for that model_name in the hash, 
 *   caches with the association passed
 */
JMVC.ActiveRecord.process_find_results = function(find_params) {
	
	return function(object_hash) {
        // determine association sql that can be cached
		// go through each find_params.include
		// {items: ['customers']}
		var cache_associations = function(associations, parent) {
			parent = parent || this.klass_name;
			if(associations == null) {
				// do nothing
				// allow null for hashes with a dead end
			} else if (typeof(associations) == 'string') {
				return cache_association(associations, parent);
			} else if (typeof(associations) == 'object' && associations.length) { // is an array
				associations.each(function(association) {
			        cache_associations(association, parent);
			    });
			} else if (typeof(associations) == 'object') { // is a hash
				$H(associations).keys().each(function(association_name) {
			        parent_model_name = cache_associations(association_name, parent);
			        cache_associations(associations[association_name], parent_model_name);
			    });
			}
		}.bind(this)
		
		// cache the association and return the model_name
		var cache_association = function(association_name, base_model_name) {
			if(!objects_hash[base_model_name])
				return;
				
	        var base_model = window[base_model_name];
			if(window[base_model_name].klass().associations().belongs_to[association_name]) {
				var type = 'belongs_to';
				var association = window[base_model_name].klass().associations().belongs_to[association_name];
			} else {
				var type = 'has_many';
				var association = window[base_model_name].klass().associations().has_many[association_name];
			}
	        var association_model = association.model_name;
		
			if(window[base_model_name].associations().belongs_to[association_name] || 
			  window[base_model_name].associations().has_many[association_name]) {
			  	for(var i=0; i<objects_hash[base_model_name].length; i++) {
					var object = objects_hash[base_model_name][i];
					association_data = object[association_name]({no_send: true});
					if(association_data)
						JMVC.QueryController.add_to_cache(association_data.sql);
				}
			}
			
			return association_model;
		}.bind(this)
		var cache_object = function(object, include_arr) {
			var finder_sql = this.find(object.id, {no_send: true}).sql;
			JMVC.QueryController.add_to_cache(finder_sql);
		}.bind(this)
		
	    var return_objects = [];
		var objects_hash = {};
	    // turn data into client objects
	    for(var table in object_hash) {
	        var model = JMVC.ActiveRecord.table_name_to_model_name(table);
	        for(var primary_key in object_hash[table]) {
				var object = new window[model](object_hash[table][primary_key]);
				cache_object(object);
				if(!objects_hash[model])
					objects_hash[model] = [];
				objects_hash[model].push(object);
				if(model == this.klass_name)
					return_objects.push( object );
	        }
	    }
		
		cache_associations(find_params.include);
		
        if(find_params.type == 'all' || !find_params.type)
            return return_objects;
        return (return_objects.length > 0? return_objects[0]: null);
	}.bind(this)
}
/**
 * Processes includes for a request and converts them to SQL joins that will return the extra data needed.
 * @private
 * @param {Object} includes
 * @param {Object} find_params
 */
JMVC.ActiveRecord.process_includes = function(includes, find_params) {
    // for keeping track of duplicates
    var left_join_hash = $H();
	var sql_arr = [];
    sql_arr.push('FROM');
	//returns JOIN as condition
	var association_sql = function(foreign_table, foreign_key, base_table, type) {
        if(type == 'has_many')
            return foreign_table+'.'+foreign_key+' = '+base_table+'.id';
        else if(type == 'belongs_to')
            return base_table+'.'+foreign_key+' = '+foreign_table+'.id';
    }
    
	// local helper function that searches the left_join_hash data structure for a duplicate association_object
    var find_association_object = function(association_table, association_object) {
        left_join_hash[association_table].association_objects.each(function(object) {
            if(object.foreign_key == association_object.foreign_key &&
               object.base_table == association_object.base_table &&
               object.type == association_object.type) {
                    return object;
               }
        });
        return null;
    }
    
	//processes a type of association for a model
	//returns the model name for the association created
	var process_association = function(association_name, base_model_name, order) {
        var base_model = window[base_model_name];
		if(window[base_model_name].klass().associations().belongs_to[association_name]) {
			var type = 'belongs_to';
			var association = window[base_model_name].klass().associations().belongs_to[association_name];
		} else {
			var type = 'has_many';
			var association = window[base_model_name].klass().associations().has_many[association_name];
		}
        var association_model = association.model_name;
        var foreign_key = association.foreign_key;
        if( !left_join_hash[association_model] ) {
            left_join_hash[association_model] = {order: order, association_objects: []};
        } else {
            left_join_hash[association_model].order = 
                ( (left_join_hash[association_model].order < order) ? left_join_hash[association_model].order : order);
        }
        
        var association_object = {
            foreign_key: foreign_key,
            base_model: base_model_name,
            type: type
        };
        
        // check for duplicates
        if(!find_association_object(association_model, association_object)) {
            left_join_hash[association_model].association_objects.push(association_object);
        }
		
		return association.model_name;
    }
	
	// handles finds like: 
	// this.thing = Store.find('all', {include: {items: {customers: 'more_item'}, layout: null}})
    var build = function(associations, parent) {
		parent = parent || this.klass_name;
		if(associations == null) {
				// do nothing
				// allow null for hashes with a dead end
		} else if (typeof(associations) == 'string') {
			return process_association(associations, parent, 1);
		} else if (typeof(associations) == 'object' && associations.length) { // is an array
			associations.each(function(association) {
		        build(association, parent, 1);
		    });
		} else if (typeof(associations) == 'object') { // is a hash
			$H(associations).keys().each(function(association_name) {
		        parent_model_name = build(association_name, parent, 1);
		        build(associations[association_name], parent_model_name, 1);
		    });
		}
	}.bind(this)
    
    // run through all the associations in includes
    build(includes)
    
	var from_models = left_join_hash.keys();
	from_models.push(this.klass_name);
	
    // maintain ordering of the included elements (needed for recursive includes)
    var order_tracker = 1;
    var ordered_left_join_array = [];
    while(left_join_hash.keys().length > 0) {
        for(var model_name in left_join_hash) {
            if(order_tracker == left_join_hash[model_name].order) {
                ordered_left_join_array.push( {model_name: model_name, association_objects: left_join_hash[model_name].association_objects} );
                left_join_hash.remove(model_name);
            }
        }
        order_tracker++;
    }
	if(find_params)	find_params.from_models = from_models;
    
    // turn the ordered left join array into sql text
    var table_array = [];
    var left_join_array = [];
    var conditions_array = [];
	var join_sql = [];
	var from_clause = this.table_name()
    if(ordered_left_join_array.length > 0) {
        ordered_left_join_array.each(function(left_join_object) {
            conditions_array = [];
            table_array = [' LEFT OUTER JOIN', window[left_join_object.model_name].table_name(), 'ON'];
            left_join_object.association_objects.each(function(object) {
                conditions_array.push( association_sql(window[left_join_object.model_name].table_name(), 
					object.foreign_key, window[object.base_model].table_name(), object.type) );
            });
            table_array.push(conditions_array.join(' OR '));
            join_sql.push(table_array.join(' '));
			if(JMVC.database_adapter == 'msaccess') {
				join_sql.push(')');
				from_clause = '('+from_clause;
			}
        });
    }
	
    sql_arr.push(from_clause);
    sql_arr.push(join_sql.join(''));
    return sql_arr.join(' ');
}

/**
 * Adds conditions to the includes conditions.  At some point this would handle those conditions, but it doesn't anymore
 * @private
 * @param {Object} includes
 * @param {Object} conditions
 * @param {Object} find_params
 */
JMVC.ActiveRecord.process_includes_conditions = function(includes, conditions, find_params) {
    includes = includes || [];
    conditions = conditions || '';
    var sql_query_array = [];
    // includes is passed by reference here and changed inside process_conditions
    conditions_sql = this.process_conditions(conditions);
    if(conditions_sql.replace(/\s+/, '')!='')
		sql_query_array.push('WHERE '+conditions_sql);
    // includes sql comes before the condition sql
    sql_query_array.unshift( this.process_includes(includes, find_params) );
    return sql_query_array.join(' ');
}
/**
 * takes a limit and offset and returns SQL
 * @private
 * @param {Object} limit
 * @param {Object} offset
 */
JMVC.ActiveRecord.process_limit_offset = function(limit, offset) {    
	if(offset!=null && JMVC.database_adapter == 'msaccess')
		throw new JMVC.Error(new Error(), 'offset is not a defined operation in MS Access');
	if(limit != null && JMVC.database_adapter == 'msaccess') {
        return ['TOP', limit].join(' ');
	}
    else if(limit != null) {
        var elements_array = ['LIMIT', (offset == null ? 0 : offset)+',', limit];
        return elements_array.join(' ');
    }
    return '';
}
/**
 * Processes the order part of sql
 * @private
 * @param {Object} order
 */
JMVC.ActiveRecord.process_order = function(order) {
    if(!order) return ''
	
	return 'ORDER BY '+order;
	if(order) {
        var sql_column = this._sql_column_name(order.split(/\s+/)[0]);
        var direction = order.split(/\s+/)[1];
        var elements_array = ['ORDER BY', sql_column, direction];
        return elements_array.join(' ');
    }
    return '';
}
/**
 * Sets the table name.  This is useful if the table name is something other than the plural model name.
 * @param {String} table_name
 */
JMVC.ActiveRecord.set_table_name = function(table_name) {
	JMVC.ActiveRecord.table_names_hash[table_name] = this.klass_name;
}
/**
 * Sets up associations for all the models.  This is called when the first association is tried.
 * @private
 */
JMVC.ActiveRecord.setup_associations = function(){
    // set up associations
    for (var i=0; i<JMVC.app_schema.tables.length; i++) {
        var model_name = JMVC.ActiveRecord.table_name_to_model_name(JMVC.app_schema.tables[i].name);
		for(var j=0; j<window[model_name].pending_belongs_to.length; j++) {
			var belongs_to_data = window[model_name].pending_belongs_to[j];
			window[model_name].create_belongs_to(belongs_to_data.association_name, belongs_to_data.info);
		}
		for(var j=0; j<window[model_name].pending_has_many.length; j++) {
			var has_many_data = window[model_name].pending_has_many[j];
			window[model_name].create_has_many(has_many_data.association_name, has_many_data.info);
		}
		delete window[model_name].pending_belongs_to;
		delete window[model_name].pending_has_many;
		JMVC.ActiveRecord._associations_are_setup = true;
    }
}


/**
 * Creates a request that will sum a column values for a given table.
 * @param {String} column_name The column to be totalled.  This should be a DECIMAL or INTEGER type column.
 * @param {Object} params Optional hash with the following optional attributes:
 * <table class='params_table'>
 *      <tr><th>Attribute</th><th>Value</th></tr>
 *      <tr><td>conditions: </td><td>String of sql conditions.</td></tr>
 * </table>
 * @return {Integer} the sum for a given column.
 */
JMVC.ActiveRecord.sum= function(column_name, params) {
    // override params.include here
	params = params || {};
    var sql_query_array = ['SELECT SUM('+column_name+') FROM', this.table_name()];
    sql_query_array.push( this.process_includes_conditions(params.include, params.conditions) );
    
    if(params.no_send && params.no_send == true)
        return {sql: sql, params: params};
    return JMVC.QueryController.send(sql_query_array.join(' '), params);
}

// this function returns the model name for the given table_name
// after all of JMVC's models have been inititialized, this function is guaranteed to return the correct model
// before that (during load_from_schema), we take our best guess
/**
 * Converts a table name to a model name
 * @param {String} table_name - the name of a table. EX: tasks.
 * @returns {String} the model name. EX: Task.
 */
JMVC.ActiveRecord.table_name_to_model_name = function(table_name) {
	// after application initialization, all calls to table_name_to_model_name will use this data structure
	// it gets set up when the models are initialized
	if(JMVC.ActiveRecord.table_names_hash[table_name])
		return JMVC.ActiveRecord.table_names_hash[table_name];
	// otherwise take our best guess: tables --> Table
	if(table_name.singularize())
    	return table_name.singularize().first_capitalize();
	return table_name.first_capitalize();
}



/**
*
*Finds the record from the passed id, instantly saves it with the passed attributes (if the validation permits it), and returns it. If the save fails under validations, the unsaved object is still returned.
*
*The arguments may also be given as arrays in which case the update method is called for each pair of id and attributes and an array of objects is returned.
*
*<p>Example of updating one record:</p>
*
*<pre class='example'>
*  Person.update(15, {user_name: 'Samuel', group: 'expert'})</pre>
*
*<p>Example of updating multiple records:</p>
*
*<pre class='example'>
*  var people = { 1 : { "first_name": "David" }, 2 : { "first_name": "Jeremy"} }
*  Person.update($H(people).keys(), $H(people).values())</pre>
*
*
*/
JMVC.ActiveRecord.update = function(id, attributes, request_params) {
	if(typeof(id) == 'object') {
		var idx = -1;
		id.collect(function(id) {
			idx += 1;
			this.update(id, attributes[idx], request_params);
		})
	} else {
		var object = this.find(id);
		object.update_attributes(attributes, request_params);
		return object;
	}
}


/**
 * Updates all records with the SET-part of an SQL update statement in +updates+ and returns an integer with the number of rows updated.
 * <p>Example:</p>
 * <pre class='example'>
 * Billing.update_all({category: 'authorized', approved: 1}, "author = 'David'" )</pre>
 * @param {Object} updates
 * @param {String} conditions
 * @param {Object} params
 */
JMVC.ActiveRecord.update_all = function(updates, conditions, params) {
	var UpdateGrammar = {}
	UpdateGrammar._setup_grammar = function() {
		var g = UpdateGrammar;
		with ( Parser.Operators ) {
	  	  g.single_quote = token(/'[^']*'/)
		  g.double_quote = token(/"[^"]*"/)
		  g.word = token(/\w+/)
		  g.parts = any(g.single_quote, g.double_quote, g.word) 
		  g.equal = token('=')
		  g.pair = pair(g.word, g.parts,g.equal )
		  g.update_list = list(g.pair)
		  g.list = list(g.parts)
		}
	}();
    var values = UpdateGrammar.update_list(updates)[0];
	var new_updates = [];
	values.each(function(value) {
			new_updates.push(['[',value[0],']','=',value[1]].join(''));
	})
	conditions = conditions || '';
	var sql_template = new Template("UPDATE #{table_name} SET #{updates} ");
	var sql = sql_template.evaluate({table_name: this.klass().table_name(), updates: new_updates.join(',')});
	if(conditions.replace(/\s+/g, '')!='') sql += 'WHERE '+this.process_conditions(conditions);
	return JMVC.QueryController.send(sql, params || {});
}

/**
 * Converts the value into the format ActiveRecord uses for internal storage.
 * @private
 * @param {Object} value
 * @param {Object} column
 */
JMVC.ActiveRecord.typecast_attribute = function(value, column) {
	return column.typecast_attribute(value);
}



//------------------------------ FIELDS ------------


/**
 * List of all active record table names
 * @private
 */
JMVC.ActiveRecord.table_names_hash = {};

/**
 * flag signifying whether associations are set up or not true if they have been set up false if not
 * @private
 */
JMVC.ActiveRecord._associations_are_setup = false;