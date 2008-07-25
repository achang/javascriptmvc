MVC.Delegator={
	node_path: function(el){
		var body = document.documentElement,parents = [],iterator =el;
		while(iterator != body){
			parents.unshift({tag: iterator.nodeName, className: iterator.className, id: iterator.id, element: iterator});
			iterator = iterator.parentNode;
			if(iterator == null) return [];
		}
		parents.push(body);
		return parents;
	},
	dispatch_event: function(event){
		var target = event.target, matched = false, ret_value = true,matches = [];
		var delegation_events = MVC.Delegator.events[event.type];
        var parents_path = MVC.Delegator.node_path(target);
        
		for(var i =0; i < delegation_events.length;  i++){
			var delegation_event = delegation_events[i];
			var match_result = delegation_event.match(target, event, parents_path);
			if(match_result){
				matches.push(match_result);
			}
		}

		if(matches.length == 0) return true;
		MVC.Controller.add_kill_event(event);
		matches.sort(MVC.Delegator.sort_by_order);
        var match;
		for(var m = 0; m < matches.length; m++){
            match = matches[m];
            ret_value = match.delegation_event._func( {event: event, element: match.node} ) && ret_value;
			if(event.is_killed()) return false;
		}
	},
    sort_by_order: function(a,b){
    	if(a.order < b.order) return 1;
    	if(b.order < a.order) return -1;
    	var ae = a._event, be = b._event;
    	if(ae == 'click' &&  be == 'change') return 1;
    	if(be == 'click' &&  ae == 'change') return -1;
    	return 0;
    }
};
MVC.Delegator.events = {};
MVC.DelegationEvent = function(selector, event, f){
    this._event = event;
    this._selector = selector;
    this._func = f;

    if(event == 'submit' && MVC.Browser.IE) return this.submit_for_ie();
	if(event == 'change' && MVC.Browser.IE) return this.change_for_ie();
	if(event == 'change' && MVC.Browser.WebKit) return this.change_for_webkit();
	
    this.add_to_delegator();
};
MVC.DelegationEvent.prototype = {
    event: function(){
    	if(MVC.Browser.IE){
            if(this._event == 'focus')
    			return 'activate';
    		else if(this._event == 'blur')
    			return 'deactivate';
    	}
    	return this._event;
    }, 
    capture: function(){
        return MVC.Array.include(['focus','blur'],this._event);
    },
    add_to_delegator: function(selector, event, func){
        var s = selector || this._selector;
        var e = event || this.event();
        var f = func || this._func;
        
        if(!MVC.Delegator.events[e]){
            MVC.Event.observe(document.documentElement, e, MVC.Delegator.dispatch_event, this.capture() );
            MVC.Delegator.events[e] = [];
		}
		MVC.Delegator.events[e].push(this);
    },
    
    submit_for_ie : function(){
		this.add_to_delegator(null, 'click');
        this.add_to_delegator(null, 'keypress');
        
        this.filters= {
			click : function(el, event){
				return el.nodeName.toUpperCase() == 'INPUT' && el.type.toLowerCase() == 'submit';
			},
			keypress : function(el, event){
				if(el.nodeName.toUpperCase()!= 'INPUT') return false;
				if(typeof Prototype != 'undefined'){ return event.keyCode == 13; }
				return event.charCode == 13;
			}
		};
	},
	change_for_ie : function(){
		this.add_to_delegator(null, 'click');
        this.end_filters= {
			click : function(el, event){
				if(typeof el.selectedIndex == 'undefined' || el.nodeName.toUpperCase() != 'SELECT') return false; //sometimes it won't exist yet
				var old = el.getAttribute('_old_value');
				if( old == null){
					el.setAttribute('_old_value', el.selectedIndex);
					return false;
				}else{
					if(old == el.selectedIndex.toString()) return false;
					el.setAttribute('_old_value', null);
					return true;
				}
			}
		};
	},
	change_for_webkit : function(){
		this.controller.add_register_action(this,document.documentElement, 'change');
		this.end_filters= {
			change : function(el, event){
				if(typeof el.value == 'undefined') return false; //sometimes it won't exist yet
				var old = el.getAttribute('_old_value');
				el.setAttribute('_old_value', el.value);
				return el.value != old;
			}
		};
	},
    regexp_patterns:  {tag :    		/^\s*(\*|[\w\-]+)(\b|$)?/,
        				id :            /^#([\w\-\*]+)(\b|$)/,
    					className :     /^\.([\w\-\*]+)(\b|$)/},
    selector_order : function(){
		if(this.order) return this.order;
		var selector_parts = this._selector.split(/\s+/);
		var patterns = this.regexp_patterns;
		var order = [];
		for(var i =0; i< selector_parts.length; i++){
			var v = {}, r, p =selector_parts[i];
			for(var attr in patterns){
				if( patterns.hasOwnProperty(attr) ){
					if( (r = p.match(patterns[attr]))  ) {
						if(attr == 'tag')
							v[attr] = r[1].toUpperCase();
						else
							v[attr] = r[1];
						p = p.replace(r[0],'');
					}
				}
			}
			order.push(v);
		}
		this.order = order;
		return this.order;
	},
    
    match: function(el, event, parents){
        if(this.filters && !this.filters[event.type](el, event)) return null;
		//if(this.controller.className != 'main' &&  (el == document.documentElement || el==document.body) ) return false;
		var matching = 0;
		for(var n=0; n < parents.length; n++){
			var node = parents[n], match = this.selector_order()[matching], matched = true;
			for(var attr in match){
				if(!match.hasOwnProperty(attr) || attr == 'element') continue;
				if(match[attr] && attr == 'className'){
					if(! MVC.Array.include(node.className.split(' '),match[attr])) matched = false;
				}else if(match[attr] && node[attr] != match[attr]){
					matched = false;
				}
			}
			if(matched){
				matching++;
                if(matching >= this.selector_order().length) {
                    if(this.end_filters && !this.end_filters[event.type](el, event)) return null;
                    return {node: node.element, order: n, delegation_event: this};
                }
			}
		}
		return null;
    }
};
