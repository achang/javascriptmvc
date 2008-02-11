JMVC.GenericAdapter = Class.create();

JMVC.GenericAdapter.setup = function(schema) {
	throw new JMVC.Error(new Error(), 'setup must be defined for adapters');
};

// boolean attribute that signifies whether setup has been performed on this adapter or not
JMVC.GenericAdapter.setup_complete = false;

JMVC.GenericAdapter.execute = function() {
	throw new JMVC.Error(new Error(), 'execute must be defined for adapters');
};