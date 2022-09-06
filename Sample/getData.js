const settings = require('../settings.json'); 
const si = require('systeminformation');

module.exports = async function () {
  try {
	  
	var systemData = {};
	  
	systemData.timestamp = Date.now();

    var data = await si.mem();

	systemData.memTotal = data.total;
	systemData.memUsed = data.used;
	
	data = await si.currentLoad();
	systemData.cpuLoad = data.currentLoad;

	data = await si.cpuTemperature();
	systemData.cpuTemp = data.main;

	data = await si.fsSize();
	
	systemData.fs = [];

	for(var i = 0; i < data.length; i++){
		systemData.fs.push({
			name: data[i].fs,
			size: data[i].size,
			used: data[i].use
		});		
	}
	
	data = await si.networkStats();
	
	systemData.network = [];

	for(var i = 0; i < data.length; i++){
		systemData.network.push({
			name: data[i].iface,
			sent: data[i].tx_bytes,
			recieved: data[i].rx_bytes
		});		
	}

	data = await si.battery();

	
	systemData.batteryPercent = data.percent;
	systemData.batteryCharging = data.isCharging;
		
    console.log(systemData);

	return systemData;
	
  } catch (e) {
    console.log(e);
  }
}