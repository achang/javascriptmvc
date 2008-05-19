// Much of the code in this plugin is adapated from Prototype
//  Prototype JavaScript framework, version 1.6.0.1
//  (c) 2005-2007 Sam Stephenson

MVC.$E = function(element){
	if(typeof element == 'string')
		element = document.getElementById(element);
    if (!element) return element;
	return element._mvcextend ? element : MVC.$E.extend(element);
};
//From Prototype
MVC.Object.extend(MVC.$E, {
	insert: function(element, insertions) {
		element = MVC.$E(element);
		if(typeof insertions == 'string'){insertions = {bottom: insertions};};

		var content, insert, tagName, childNodes;
		for (position in insertions) {
		  if(! insertions.hasOwnProperty(position)) continue;
		  content  = insertions[position];
		  position = position.toLowerCase();
		  insert = MVC.$E._insertionTranslations[position];
		  if (content && content.nodeType == 1) {
		    insert(element, content);
		    continue;
		  }
		  tagName = ((position == 'before' || position == 'after') ? element.parentNode : element).tagName.toUpperCase();
		  childNodes = MVC.$E._getContentFromAnonymousElement(tagName, content);
		  if (position == 'top' || position == 'after') childNodes.reverse();
		  for(var c = 0; c < childNodes.length; c++){
		  	insert(element, childNodes[c]);
		  }
		}
		return element;
	},
	_insertionTranslations: {
	  before: function(element, node) { element.parentNode.insertBefore(node, element);},
	  top: function(element, node) { element.insertBefore(node, element.firstChild);},
	  bottom: function(element, node) { element.appendChild(node);},
	  after: function(element, node) { element.parentNode.insertBefore(node, element.nextSibling);},
	  tags: {
	    TABLE:  ['<table>',                '</table>',                   1],
	    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
	    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
	    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
	    SELECT: ['<select>',               '</select>',                  1]
	  }
	},
	_getContentFromAnonymousElement: function(tagName, html) {
	  var div = document.createElement('div'), t = MVC.$E._insertionTranslations.tags[tagName];
	  if (t) {
	    div.innerHTML = t[0] + html + t[1];
		for(var i=0; i < t[2]; i++){
			div = div.firstChild;
		}
	  }else div.innerHTML = html;
	  return MVC.Array.from(div.childNodes);
	},
	next : function(element){
		var next = element.nextSibling;
		while(next && next.nodeType != 1)
			next = next.nextSibling;
		return next;
	},
	toggle : function(element){
		element.style.display == 'none' ? element.style.display = '' : element.style.display = 'none';
	}
});




MVC.$E.extend = function(el){
	for(var f in MVC.$E){
		if(!MVC.$E.hasOwnProperty(f)) continue;
		var func = MVC.$E[f];
		if(typeof func == 'function'){
			var names = MVC.Function.params(func);
			if( names.length == 0) continue;
			var first_arg = names[0];
			if( first_arg.match('element') ) MVC.$E._extend(func, f, el);
		}
	}
	el._mvcextend = true;
	return el;
};
MVC.$E._extend = function(f,name,el){
	el[name] = function(){
		var arg = MVC.Array.from(arguments);
		arg.unshift(el);
		return f.apply(el, arg); 
	};
};
MVC.Element = MVC.$E;
if(!MVC._no_conflict){
	$E = MVC.$E;
}
