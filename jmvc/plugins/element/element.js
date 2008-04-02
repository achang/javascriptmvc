$MVC.Element = function(element){
	if(typeof element == 'string')
		element = document.getElementById(element);
	return element;//Element.extend(element);
};



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
		  tagName = ((position == 'before' || position == 'after') ? element.parentNode : element).tagName.toUpperCase();
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
		element.style.display == 'none' ? element.style.display = '' : element.style.display = 'none';
	}
});

$MVC.Element.extend = function(el){
	for(var f in $MVC.Element){
		if()
	}
}


if(!$MVC._no_conflict){
	$E = Element = $MVC.Element;
}
