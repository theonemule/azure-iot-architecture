const nodeWebCam = require('node-webcam');
const fs = require('fs');
const path = require('path');

// specifying parameters for the pictures to be taken
var options = {
    width: 1920,
    height: 1080, 
    quality: 90,
    delay: 0,
    saveShots: true,
    output: "jpeg",
    device: false,
    callbackReturn: "location"
};

// create instance using the above options
var webcam = nodeWebCam.create(options);

module.exports =  async function (name) {
	var path = `./images/${name}`;

	if(!fs.existsSync('./images/')) {
		fs.mkdirSync('./images/');
	} 


	if(!fs.existsSync(path)) {
		fs.mkdirSync(path);
	} 
	

	return new Promise((resolve, reject) => {
		webcam.capture(`./images/${name}/image.jpg`, (err, data) => {
			if(!err){
				resolve(data);				
			}else{
				reject(err);				
			}
		})	
	});	
}
