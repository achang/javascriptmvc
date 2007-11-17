Junction.include_order = ["/active_record/TrimQuery/parser.js",
						  "/active_record/Query/Query.js",
						  "/active_record/TrimQuery/TrimQuery.js",
						  "/active_record/Query/Adapters.js",
						  "/active_record/Query/Interfaces.js",
						  "/active_record/Query/QueryController.js",
						  "/active_record/ActiveRecord.js"]
//-----END

for(var i = 0; i < Junction.include_order.length; i++)
{
	Junction.require(JUNCTION_ROOT+'lib'+Junction.include_order[i], {cache: true});
}