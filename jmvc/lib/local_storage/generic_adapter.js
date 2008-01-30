JMVC.GenericAdapter = Class.create();

JMVC.GenericAdapter.setup = function(schema) {
	throw new JMVC.Error(new Error(), 'setup must be defined for adapters');
}

// boolean attribute that signifies whether setup has been performed on this adapter or not
JMVC.GenericAdapter.setup_complete = false;

JMVC.GenericAdapter.execute = function() {
	throw new JMVC.Error(new Error(), 'execute must be defined for adapters');
}

LocalStorage = Class.create();

LocalStorage.setup = function(schema) {
	LocalStorage.type = 'Gears';
	if(!window.google || !google.gears) LocalStorage.type = 'TrimQuery';
	JMVC[LocalStorage.type+'Adapter'].setup(schema);
}

LocalStorage.execute = function(sql) {
	return JMVC[LocalStorage.type+'Adapter'].execute(sql);
}