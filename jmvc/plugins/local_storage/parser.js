var Cruiser = {
	About: {
		Description : 'Javascript framework built on type of Prototype and Scrip.taculo.us',
		Author : 'Dan Yoder',
		Version : { major: '0', minor: '4' },
		Notices : { Copyright: '(c) 2007 Dan Yoder' },
		License : 'Cruiser is freely distributable under the terms of the MIT license.',
		URL : 'http://dev.zeraweb.com/cruiser/'
	}
};
Object.extend( String.prototype, {
	// strip itself comes from prototype.js ...
	lstrip: function() { return this.replace(/^\s*/,''); },
	rstrip: function() { return this.replace(/\s*$/,''); },
	// map: apply a function multiple times to a string
	// with different arguments each time ...
	map: function( args, f ) {
		var g = function( s, p ) { return f.apply( s, p ); };
		return $A( args ).inject( this, g );
	}, 
	// toArray will still work normally; however, now it will
	// also take a split parameter - but instead of returning
	// 'blanks', it will return nulls in their place
	toCharArray: String.prototype.toArray,
	toArray: function( separator ) {
		if ( separator ) {
			var f = function( s ) { return s.blank() ? null : s.strip(); };
			return $A( this.split( separator || ',' ) ).map( f );
		} else { return this.toCharArray(); }
	},
	// "eats" the argument r from the string, 
	// ex: "foo".eat('f') >> ['f','oo']
	// ex: "bar".eat('f') >> null
	// can also take a regex - useful for simple parsing tasks
	eat: function(r) {
		if ( typeof( r ) != 'string' ) { r = r.source; }
		r = '^' + r; // make sure we anchor to start
		var m = this.strip().match( new RegExp( r ) ), s = []; 
		s[0] = m ? m[0].strip() : null ; 
		if ( s[0] ) { 
			s[1] = this.strip()
				.substring( m[0].length )
				.lstrip(); 
			return s; 
		} else { return null; } 
	}
});
Cruiser.Parser = {
	About: {
		Description : 'Javascript parsing framework',
		Author : 'Dan Yoder',
		Version : { major: '0', minor: '2' },
		Notices : { Copyright: '(c) 2007 Dan Yoder' },
		License : 'Cruiser is freely distributable under the terms of the MIT license.',
		URL : 'http://dev.zeraweb.com/parser'
	}
};
var Parser = {};
Parser.Exception = function(s) { 
	return "Parse error at '" + s.substring(0,10) + " ...'"; 
};
Parser.Operators = {
	token: function(r) { 
		return function(s) { 
			var rx = s.eat(r);
			if (rx) return rx; 
			else throw Parser.Exception(s);
		};
	},
	any: function() {
		var px = $A(arguments);
		return function(s) { 
			var r = null;
			for (var i = 0; i<px.length; i++) { 
				try { r = (px[i].call(this,s)); } catch(e) { r = null; }
				if (r) return r; 
			} 
			throw Parser.Exception(s);
		};
	},
	each: function() { 
		var px = $A(arguments); 
		return function(s) { 
			var rx = [], r = null;
			for (var i = 0; i<px.length; i++) { 
				try { r = (px[i].call(this,s)); }
				catch(e) { throw Parser.Exception(s); }
				rx.push(r[0]); s = r[1];
			} 
			return [ rx, s]; 
		};
	},
	many: function(p) {
		return function(s) {
			var rx = [], r = null;
			while (s) { 
				try { r = p.call(this,s); }
				catch (e) { return [ rx, s ]; }
				rx.push(r[0]); s = r[1];
			}
			return [ rx, s ];
		};
	},
	until: function(p) {
		return function(s) {
			var r = '', t = '';
			while( s && ! p.call(this,s) ) {
				r += s[0]; s.shift;
			}
			return [ r, s ];
		};
	},
	list: function(p,delim,trail) {
		trail = trail||false;
		delim = delim?delim:Parser.Operators.token(',');
		return function(s) {
			var rx = [], r = null; 
			while (s) {
				try { r = p.call(this,s) } 
				catch(e) {
					if (trail) return [ rx, s];
					else throw Parser.Exception(s);
				}
				rx.push(r[0]); s = r[1];
				try { r = delim(s); }
				catch(e) { return [ rx, s ]; }
				s = r[1];
			}
			return [ rx, s ];
		};
	},
	between: function(d1,p,d2) { 
		d2 = d2||d1;
		return function(s) {
			var r = null;
			try { r = Parser.Operators.each(d1,p,d2).call(this,s) }
			catch(e) { throw Parser.Exception(s); }
			return [ r[0][1],r[1] ]; 
		};
	},
	pair: function(p1,p2,d) { 
		d = d||Parser.Operators.token(',');
		p2 = p2||p1;
		return function(s) { 
			var r = null;
			try { r = Parser.Operators.each(p1,d,p2).call(this,s); }
			catch(e) { throw Parser.Exception(s); }
			return [ [ r[0][0], r[0][2] ], r[1] ];
		};
	},
	forward: function( gr, fname ) {
		return function(s) { return gr[fname].call(this,s); };
	},
	process: function(rule,fn) {
		return function(s) { 
			var r = rule.call(this,s);
			return [ fn.call(this,r[0]),r[1] ]; };
	},
	ignore: function(rule) { 
		return function(s) { 
			rule.call(this,s); return []; 
		};
	}
};