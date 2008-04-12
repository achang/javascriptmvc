/**
 * Event describes 2 functions
 * 	Event.observe
 * 	Event.stopObserving
 */

if(typeof Prototype == 'undefined') 
	include("standard");
else{
	MVC.Event = Event;
	MVC.Event.stop_observing = Event.stopObserving;
	
	
	
}
	
//jQuery's wont work for controllers because it doesn't allow capture