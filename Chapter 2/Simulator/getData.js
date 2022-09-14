const settings = require('./simulator-settings.json'); 

module.exports = async function () {
  try {
	  
	var systemData = {};

	systemData.timestamp = Date.now();

	systemData.memTotal = settings.memTotal;	
	var free = Math.floor(((Math.random() * (settings.memFreeUpper - settings.memFreeLower)) + settings.memFreeLower) * settings.memTotal);
	systemData.memUsed = settings.memTotal - free;
	
	systemData.cpuLoad = Math.floor(((Math.random() * (settings.cpuLoadUpper - settings.cpuLoadLower)) + settings.cpuLoadLower) * 100);
	systemData.cpuTemp = Math.floor(((Math.random() * (settings.cpuTempUpper - settings.cpuTempLower)) + settings.cpuTempLower));

	systemData.fs = [];

	for(var i = 0; i < settings.fs.length; i++){		
		var fs = {};
		fs.name = settings.fs[i].name;
		fs.size = settings.fs[i].size;
		fs.used = settings.fs[i].used = Math.floor((((Math.floor(((Math.random() * (settings.fs[i].freeUpper - settings.fs[i].freeLower)) + settings.fs[i].freeLower) * settings.fs[i].size)) / settings.fs[i].size))*1000)/10;		
		systemData.fs.push(fs);		
	}
	
	systemData.network = [];

	if (!settings.sent){
		settings.sent = Math.floor(Math.random() * 100000000);
		settings.recieved = Math.floor(Math.random() * 100000000)			
	}


	for(var i = 0; i < settings.network.length; i++){
		var net = {};
		
		
		settings.sent += Math.floor(Math.random() *  settings.network[i].rate);
		settings.recieved += Math.floor(Math.random() *  settings.network[i].rate);
		
		net.name = settings.network[i].name;
		net.sent = settings.sent
		net.recieved = settings.recieved;
		systemData.network.push(net);		
	}
	
	systemData.batteryPercent = Math.floor(((Math.random() * (settings.batteryUpper - settings.batteryLower)) + settings.batteryLower) * 100);
	systemData.batteryCharging = settings.batteryExists;

    console.log(systemData);
	
	return systemData;
	
  } catch (e) {
    console.log(e);
  }
}

