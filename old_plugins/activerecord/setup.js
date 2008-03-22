JMVC.include_order = ["/active_record/TrimQuery/parser.js",
						  "/active_record/Query/Query.js",
						  "/active_record/TrimQuery/TrimQuery.js",
						  "/active_record/Query/Adapters.js",
						  "/active_record/Query/Interfaces.js",
						  "/active_record/Query/QueryController.js",
						  "/active_record/ActiveRecord.js"]
//-----END

for(var i = 0; i < JMVC.include_order.length; i++)
{
	JMVC.require(JMVC.root()+'lib'+JMVC.include_order[i], {cache: true});
}