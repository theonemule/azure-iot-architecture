//const { generateColors, createConfigs, Julia, Mandelbrot } = require( '@hiteshlala/mandelbrot-julia' );
const fs = require('fs');
const path = require('path');

/*async function draw(name) {
	try {



		const colors = generateColors(
			[ 
			{ r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)},
			{ r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)},
			{ r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)},
			{ r: Math.floor(Math.random() * 255), g: Math.floor(Math.random() * 255), b: Math.floor(Math.random() * 255)}
			], 
			Math.floor(Math.random() * 25)   
		);		

		var r = Math.floor(Math.random() * 2)
		
			const mconf = createConfigs( name );			
			mconf.minX = -3.0;
			mconf.maxX = 1;
			mconf.minY = -1;
			mconf.maxY = 1;
			mconf.width = 1920;
			mconf.height = 1080;		
			mconf.z = .4;
			mconf.r = .4;
			mconf.iterations = Math.floor(Math.random() * 50);
			
			
			mconf.colors = colors;

			const mandel = new Mandelbrot( mconf );
			await mandel.create();			



	}
		catch( e ) {
		console.log( e.message || e );
	}
}*/


var Jimp = require('jimp');

var imagew = 1920;
var imageh = 1080;
var img;
var offsetx = -imagew/1.5;
var offsety = -imageh/2;
var panx = -100;
var pany = 0;
var zoom = 800;

// Palette array of 256 colors
var palette = [];
var maxiterations = 1000;
var img;

async function init(path) {
	
	generatePalette();

	var p = new Promise(function(resolve, reject) {
		var mainImage = new Jimp(imagew, imageh, 0x0, function (err, image) {
			img = image;
			generateImage();
			img.write(path,function(){
				resolve(path);
			});
		});			
	});
	
	return p;
}

function generatePalette() {
	var roffset = Math.floor(Math.random() * 64);
	var goffset = Math.floor(Math.random() * 64);
	var boffset = Math.floor(Math.random() * 64);	
	
	for (var i=0; i<256; i++) {
		palette[i] = { r:roffset, g:goffset, b:boffset};
			
		
		if (roffset < 255) roffset += 1;
		if (goffset < 255) goffset += 1;
		if (boffset < 255) boffset += 1;
	}
	
}

function generateImage() {
	for (var y=0; y<imageh; y++) {
		for (var x=0; x<imagew; x++) {
			iterate(x, y, maxiterations);
		}
	}
}

function iterate(x, y, maxiterations) {
	var x0 = (x + offsetx + panx) / zoom;
	var y0 = (y + offsety + pany) / zoom;
	
	// Iteration variables
	var a = 0;
	var b = 0;
	var rx = 0;
	var ry = 0;
	
	// Iterate
	var iterations = 0;
	while (iterations < maxiterations && (rx * rx + ry * ry <= 4)) {
		rx = a * a - b * b + x0;
		ry = 2 * a * b + y0;
		
		// Next iteration
		a = rx;
		b = ry;
		iterations++;
	}

	var color;
	if (iterations == maxiterations) {
		color = { r:0, g:0, b:0}; // Black
	} else {
		var index = Math.floor((iterations / (maxiterations-1)) * 255);
		color = palette[index];
	}
	
	var imgColor = Jimp.rgbaToInt(color.r, color.g, color.b, 255); 
	img.setPixelColor(imgColor, x, y);
}

//init();


module.exports =  async function (name) {

	if(!fs.existsSync('./images/')) {
		fs.mkdirSync('./images/');
	} 

	var path = `./images/${name}`;
	if(!fs.existsSync(path)) {
		fs.mkdirSync(path);
	} 


	//await draw(path + "/mandel.jpg");
	await init(path + "/mandel.jpg");
	console.log(path + "/mandel.jpg")
	return path + "/mandel.jpg";

}