include("parser");
include("trimquery");
include("gears_init");
include("generic_adapter");
include("trimquery_adapter");
include("gears_adapter");

LocalStorage = Class.create();

LocalStorage.setup = function(schema) {
	if(!LocalStorage.type) {
		LocalStorage.type = 'Gears';
		if(!window.google || !google.gears) LocalStorage.type = 'TrimQuery';
	}
	JMVC[LocalStorage.type+'Adapter'].setup(schema);
};

LocalStorage.execute = function(sql) {
	return JMVC[LocalStorage.type+'Adapter'].execute(sql);
};