#!/usr/bin/env node


const settings = require('./settings.json');
const fs = require("fs");
const fsP = require("fs").promises;
var crypto = require('crypto');
const readline = require('readline');


var camera;
if (settings.camera == "device"){
	camera = require('./Sample/camera.js');
}else{
	camera = require('./Simulator/camera.js');
}

var getData;
if (settings.telemetry == "device"){
	getData = require('./Sample/getData.js');
}else{
	getData = require('./Simulator/getData.js');
}


readline.emitKeypressEvents(process.stdin);
if(process.stdin.setRawMode){
	process.stdin.setRawMode(true);
}

process.stdin.on('keypress', async (str, key) => {
	if (key.ctrl && key.name === 'c') {
	  process.exit();
	} else {
		if(str.toUpperCase() == "P"){
			var imagePath = await getImage();
			console.log(`Pictured saved to ${imagePath}`);			
		}
	}
  });


async function getImage(){
	var imageName = Date.now().toString();
	var imagePath = await camera(imageName);
	return 	imagePath;
}

const Protocol = require('azure-iot-device-mqtt').Mqtt;
// const Protocol = require('azure-iot-device-amqp').Amqp;
// const Protocol = require('azure-iot-device-http').Http;
// const Protocol = require('azure-iot-device-mqtt').MqttWs;
// const Protocol = require('azure-iot-device-amqp').AmqpWs;

var SymmetricKeySecurityClient = require('azure-iot-security-symmetric-key').SymmetricKeySecurityClient;
var ProvisioningDeviceClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;
var ProvisioningTransport = require('azure-iot-provisioning-device-mqtt').Mqtt;
// var ProvisioningTransport = require('azure-iot-provisioning-device-http').Http;
// var ProvisioningTransport = require('azure-iot-provisioning-device-amqp').Amqp;
// var ProvisioningTransport = require('azure-iot-provisioning-device-amqp').AmqpWs;
// var ProvisioningTransport = require('azure-iot-provisioning-device-mqtt').MqttWs;

const Client = require('azure-iot-device').Client;
const Message = require('azure-iot-device').Message;

function computeDerivedSymmetricKey(masterKey, regId) {
	return crypto.createHmac('SHA256', Buffer.from(masterKey, 'base64'))
		.update(regId, 'utf8')
		.digest('base64');
}

var symmetricKey = computeDerivedSymmetricKey(settings.symmetricKey, settings.registrationId);

var provisioningSecurityClient = new SymmetricKeySecurityClient(settings.registrationId, symmetricKey);

var provisioningClient;

if (settings.start == "dps"){
	provisioningClient = ProvisioningDeviceClient.create(settings.provisioningHost, settings.idScope, new ProvisioningTransport(), provisioningSecurityClient);
}


var iotEdgeLib = require('azure-iot-device').ModuleClient;

var edgeClient;

var intervalId;

async function takePicture(request, response) {
	var imageName = Date.now().toString();
	var imagePath = await camera(imageName);
	var fileStream = fs.createReadStream(imagePath);
	fs.stat(imagePath, function (err, fileStats) {
		console.log(fileStats);

		client.uploadToBlob(`${imageName}.jpg` , fileStream, fileStats.size, function (err) {
			if (err) {
				response.send(500, err, function(err) {
					if(!!err) {
						console.error('An error ocurred when sending a method response:\n' + err.toString());
					} else {
						console.log('Response to method \'' + request.methodName + '\' sent successfully.' );
					}
				});				
			} else {
				console.log('Upload successful');
				response.send(200, `${imageName}.jpg`, function(err) {
					if(!!err) {
						console.error('An error ocurred when sending a method response:\n' + err.toString());
					} else {
						console.log('Response to method \'' + request.methodName + '\' sent successfully.' );
					}
				});	
			}
			fileStream.destroy();
		});	
	});
}

function disconnectHandler () {
	sendInterval = null;
	client.open().catch((err) => {
		console.error(err.message);
	});
}

function setPoll(interval){
	if(intervalId){
		clearInterval(intervalId);
	}
	intervalId = setInterval(data, interval);
}

function messageHandler (msg) {
  console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
  client.complete(msg, printResultFor('completed'));
}

function errorHandler (err) {
  console.error(err.message);
}

function printResultFor(op) {
	return function printResult(err, res) {
		if (err) console.log(op + ' error: ' + err.toString());
		if (res) console.log(op + ' status: ' + res.constructor.name);
	};
}

function connectHandler () {
	client.getTwin(function(err, twin) {
		if (err) {
			console.error('could not get twin');
		} else {
			twin.on('properties.desired', function(delta) {
				console.log('new desired properties received:');
				console.log(JSON.stringify(delta));
				if(delta.pollFreq){
					setPoll(delta.pollFreq);
				}
			});

			var freq = 0;

			if(twin.properties.desired.pollFreq){
				freq = twin.properties.desired.pollFreq;
			}else{
				freq = settings.pollFreq;			
			}

			twin.properties.reported.update({pollFreq:freq}, function(err) {
				if (err) throw err;
				console.log('twin state reported');
			});

			setPoll(freq);			

			console.log(twin);
			console.log('twin created');
		}
	});	
}

async function data() {
	
	var systemData = await getData();	
	systemData.messageType = "telemetry";
	var message = new Message(JSON.stringify(systemData))
	message.contentEncoding = "utf-8"; 
    message.contentType = "application/json"; 
	
	if(settings.start == "dps" || settings.start == "connection_string"){
		client.sendEvent(message, printResultFor('send'));	
	}else if(settings.start == "iotedge" ){
		edgeClient.sendOutputEvent('telemetry', message, printResultFor('send'));
	}
}

function setClient(connStr){
	client = Client.fromConnectionString(connStr, Protocol);
	client.on('connect', connectHandler);
	client.on('error', errorHandler);
	client.on('disconnect', disconnectHandler);
	client.on('message', messageHandler);
	client.onDeviceMethod('takePicture', takePicture);	
	client.open()
	.catch(err => {
		console.error('Could not connect: ' + err.message);
	});		
}

async function main(){

	if(settings.start == "dps"){
		var csTxt = "./conn.json";
		if(fs.existsSync(csTxt)){
			try {
				const data = JSON.parse(fs.readFileSync(csTxt,{encoding:'utf8', flag:'r'}));
				setClient(data.connectionString);
			} catch (Err) {
				console.log(Err);
			}			
		}else{
			provisioningClient.register(async function(err, result) {
				if (err) {
					console.log("error registering device: " + err);
				} else {
					console.log('registration succeeded');
					console.log('assigned hub=' + result.assignedHub);
					console.log('deviceId=' + result.deviceId);
					var connectionString = 'HostName=' + result.assignedHub + ';DeviceId=' + result.deviceId + ';SharedAccessKey=' + symmetricKey;
					fs.writeFileSync(csTxt, JSON.stringify({connectionString:connectionString}));
					setClient(connectionString);
				}
			});	
		}
	}else if(settings.start == "connection_string") {
		setClient(settings.connString);
	}else if(settings.start == "iotedge") {

		iotEdgeLib.fromEnvironment(Protocol, function (err, client) {
			edgeClient = client;
			
			if (err) {
				throw err;
			} else {
				client.on('error', function (err) {
					throw err;
				});

				edgeClient.open(function (err) {
					if (err) {
						throw err;
					} else {
						console.log('IoT Hub module client initialized');

						edgeClient.on('inputMessage', function (inputName, msg) {
							client.complete(msg, printResultFor('Receiving message'));							
						});

						setPoll(settings.pollFreq);	
					}
				});
			}
		});
	
	}else{
		setPoll(settings.pollFreq);				
	}	
}

main();
