$MVC.Element = function(element){
	if(typeof id == 'string')
		element = document.getElementById(id);
	return element;//Element.extend(element);
};
/*
$MVC.Element.extend = function(element) {
  if (!element || _nativeExtensions || element.nodeType == 3) return element;

  if (!element._extended && element.tagName && element != window) {
    //var methods = Object.clone(Element.Methods), cache = Element.extend.cache;

    //if (element.tagName == 'FORM')
    //  Object.extend(methods, Form.Methods);
    //if (['INPUT', 'TEXTAREA', 'SELECT'].include(element.tagName))
    //  Object.extend(methods, Form.Element.Methods);
	
	for(var thing in $MVC.Element){
		
	}
	
    Object.extend(methods, Element.Methods.Simulated);

    for (var property in methods) {
      var value = methods[property];
      if (typeof value == 'function' && !(property in element))
        element[property] = cache.findOrStore(value);
    }
  }

  element._extended = true;
  return element;
};*/


$MVC.Object.extend($MVC.Element, {
	insert: function(element, insertions) {
		element = $MVC.Element(element);
		if(typeof insertions == 'string'){insertions = {bottom: insertions};};
		var content, insert, tagName, childNodes;
		for (position in insertions) {
		  if(! insertions.hasOwnProperty(position)) continue;
		  content  = insertions[position];
		  position = position.toLowerCase();
		  insert = $MVC.Element._insertionTranslations[position];
		  if (content && content.nodeType == 1) {
		    insert(element, content);
		    continue;
		  }
		  tagName = ((position == 'before' || position == 'after')
		    ? element.parentNode : element).tagName.toUpperCase();
		  childNodes = $MVC.Element._getContentFromAnonymousElement(tagName, content);
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
	  var div = document.createElement('div'), t = $MVC.Element._insertionTranslations.tags[tagName];
	  if (t) {
	    div.innerHTML = t[0] + html + t[1];
		for(var i=0; i < t[2]; i++){
			div = div.firstChild;
		}
	  }else div.innerHTML = html;
	  return $MVC.Array.from(div.childNodes);
	},
	next : function(element){
		var next = element.nextSibling;
		while(next && next.nodeType != 1)
			next = next.nextSibling;
		return next;
	},
	toggle : function(element){
		if(element.style.display == 'none')
			element.style.display = '';
		else
			element.style.display = 'none';
	}
});
if(!$MVC._no_conflict){
	//$E = Element = $MVC.Element;
}
