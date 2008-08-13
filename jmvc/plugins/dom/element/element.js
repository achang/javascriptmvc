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
		return MVC.$E(next);
	},
	toggle : function(element){
		return element.style.display == 'none' ? element.style.display = '' : element.style.display = 'none';
	},
    makePositioned: function(element) {
        element = MVC.$E(element);
        var pos = MVC.Element.getStyle(element, 'position');
        if (pos == 'static' || !pos) {
          element._madePositioned = true;
          element.style.position = 'relative';
          // Opera returns the offset relative to the positioning context, when an
          // element is position relative but top and left have not been defined
          if (window.opera) {
            element.style.top = 0;
            element.style.left = 0;
          }
        }
        return element;
    },
    getStyle:  function(element, style) {
        element = MVC.$E(element);
        style = style == 'float' ? 'cssFloat' : MVC.String.camelize(style);
        var value;
        if(element.currentStyle){
            var value = element.currentStyle[style];
        }else{
             var css = document.defaultView.getComputedStyle(element, null);
             value = css ? css[style] : null;
        }
        if (style == 'opacity') return value ? parseFloat(value) : 1.0;
        return value == 'auto' ? null : value;
    },
    cumulativeOffset: function(element) {
        var valueT = 0, valueL = 0;
        do {
          valueT += element.offsetTop  || 0;
          valueL += element.offsetLeft || 0;
          element = element.offsetParent;
        } while (element);
        return new MVC.Vector( valueL, valueT );
    },
    cumulativeScrollOffset: function(element) {
        var valueT = 0, valueL = 0;
        do {
          valueT += element.scrollTop  || 0;
          valueL += element.scrollLeft || 0;
          element = element.parentNode;
        } while (element);
        return new MVC.Vector( valueL, valueT );
    },
    isParent: function(element,child ) {
      if (!child.parentNode || child == element) return false;
      if (child.parentNode == element) return true;
      return MVC.Element.isParent(child.parentNode, element);
    },
    has: function(element, b){
      return element.contains ?
        element != b && element.contains(b) :
        !!(element.compareDocumentPosition(b) & 16);
    },
    update: function(element, content){
        element = MVC.$E(element);
        var tagName = element.tagName.toUpperCase();
        if ( ( !MVC.Browser.IE && !MVC.Browser.Opera  )|| !( tagName in MVC.$E._insertionTranslations.tags) ){
            element.innerHTML = content;
        }else{
          //remove children
          var node;
          while( (node =  element.childNodes[0]) ){ element.removeChild(node) }
          
          var children = MVC.$E._getContentFromAnonymousElement(tagName, content);
          for(var c=0; c < children.length; c++){
              element.appendChild(children[c]);
          }
        }
        return element;
   }
});






MVC.$E.extend = function(el){
	for(var f in MVC.$E){
		if(!MVC.$E.hasOwnProperty(f)) continue;
		var func = MVC.$E[f];
		if(typeof func == 'function'){
			//var names = MVC.Function.params(func);
			//if( names.length == 0) continue;
			//var first_arg = names[0];
			if( f[0] != "_" ) MVC.$E._extend(func, f, el);
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
