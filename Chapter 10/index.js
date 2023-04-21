const fs = require('fs');
const readline = require('readline');
const { CosmosClient } = require("@azure/cosmos");
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");


const blobServiceClient = new BlobServiceClient(process.env.STORAGE_CONNSTR);

const client = new CosmosClient({
    endpoint: process.env.COSMOSDB_ENDPOINT,
    key: process.env.COSMOSDB_KEY
})

const dbName = process.env.COSMOSDB_DATABASE;
const containerName = process.env.COSMOSDB_CONTAINER;
const hubName = process.env.IOTHUB_NAME

const leaseDuration = -1;

async function processLineByLine() {
	
	const containerClient = blobServiceClient.getContainerClient(containerName);
	const { database } = await client.databases.createIfNotExists({ id: dbName })
	const { container } = await database.containers.createIfNotExists({ id: containerName });

	let blobs = containerClient.listBlobsFlat();
	
	
	var iterator = containerClient.listBlobsByHierarchy("/", { prefix: `${hubName}/` });
	var entity = await iterator.next();
	
	while (!entity.done) {
		
		const firstBlob = entity.value;
		console.log(`Reading ${firstBlob.name}`)
		
		const blobClient = containerClient.getBlobClient(firstBlob.name);
		const blobProperties = await blobClient.getProperties();
		const leaseStatus = blobProperties.leaseStatus;
		console.log(leaseStatus)
		if (leaseStatus === "locked") {
			//console.log("A lease exists on the blob.");
		} else {
			const leaseClient = blobClient.getBlobLeaseClient();
			const response = await leaseClient.acquireLease(leaseDuration);
					
			var leaseId = response.leaseId;
						
			// Download the blob to a buffer
			const buffer = await blobClient.downloadToBuffer();

			// Create a string from the buffer
			const blobText = buffer.toString("utf-8");

			// Create a Readable stream from the string
			const blobStream = require("stream").Readable.from(blobText);


			const rl = readline.createInterface({
				input: blobStream,
				crlfDelay: Infinity
			});

			for await (const line of rl) {
				console.log(`Inserting: ${line}`)
				await container.items.create(JSON.parse(line));
			}
			
			await blobClient.delete({ conditions: {leaseId: leaseId } });

		}
		entity = await iterator.next();		
		
	}
	

}

processLineByLine();