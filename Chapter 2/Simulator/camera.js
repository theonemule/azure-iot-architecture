const { generateColors, createConfigs, Julia, Mandelbrot } = require( '@hiteshlala/mandelbrot-julia' );
const fs = require('fs');
const path = require('path');

async function draw(name) {
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
}

module.exports =  async function (name) {

	if(!fs.existsSync('./images/')) {
		fs.mkdirSync('./images/');
	} 

	var path = `./images/${name}`;
	if(!fs.existsSync(path)) {
		fs.mkdirSync(path);
	} 

	await draw(path + "/mandel.jpg");
	return path + "/mandel.jpg";

}