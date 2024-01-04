const { TableClient } = require("@azure/data-tables");
const tableConnectionString = process.env.TableStorageConnection;
const tableName = process.env.TableName;

const tableClient = TableClient.fromConnectionString(tableConnectionString, tableName);


module.exports = async function (context, documents) {
	

    if (documents && documents.length > 0) {
		
	
		var telemetryRecords = [];

		for(var i = 0; i < documents.length; i++){	
			
			const doc = documents[i];
			
			var telemetry = doc.Body;
		
			for(var j = 0; j < doc.Body.fs.length; j++){
				var fs = doc.Body.fs[j];
				telemetry["fs" + j + "_name"] = fs.name;
				telemetry["fs" + j + "_size"] = fs.size;
				telemetry["fs" + j + "_used"] = fs.used;
			}
			for(var j = 0; j < doc.Body.network.length; j++){
				var network = doc.Body.network[j];
				telemetry["fs" + j + "_name"] = network.name;
				telemetry["fs" + j + "_sent"] = network.sent;
				telemetry["fs" + j + "_recieved"] = network.recieved;
			}
			
			delete telemetry.fs;
			delete telemetry.network;
			
			telemetry.ts = new Date(telemetry.timestamp).toISOString();
			delete telemetry.timestamp;
			
			telemetry.partitionKey = "unknown";
			
			if(doc.SystemProperties.connectionDeviceId){
				telemetry.partitionKey = doc.SystemProperties.connectionDeviceId;
			}else if(doc.SystemProperties["iothub-connection-device-id"]){
				telemetry.partitionKey = doc.SystemProperties["iothub-connection-device-id"];				
			}
			
			telemetry.rowKey = doc._ts;
			if (doc.id && doc.id != "")
				telemetry.rowKey = doc.id;
			
			if (telemetry.rowKey == "")
				telemetry.rowKey = Date.now();
			

			console.log(telemetry)
			
			await tableClient.createEntity(telemetry);
		

			
		}

    }
}


