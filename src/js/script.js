// painterBot v0.2 by DodgeCode
// This is an experimental artwork paint by randomness

// Config
let pixelSize = 1; // Pixels
let gridSize = "600"; // Pixels
let stepInterval = 0.1; // Milliseconds

// Colors
let colors = [
	"#044A56", // Background
	"#D83640", // Selected
	"#262439",
	"#16596B",
	"#45B0A6"
];

// Directions
directions = ['up', 'down', 'left', 'right'];

// Grid
let gridCenter = gridSize/2;
let x = gridCenter;
let y = gridCenter;
let c = document.getElementById("grid");
let ctx = c.getContext("2d");
ctx.canvas.width  = gridSize;
ctx.canvas.height = gridSize;
ctx.fillStyle = colors[0];
ctx.fillRect(0,0,gridSize,gridSize);

// COLOR PICK
function getPixelColor(x, y) {
    var pxData = ctx.getImageData(x,y,1,1);
    return("rgb("+pxData.data[0]+","+pxData.data[1]+","+pxData.data[2]+")");
}
var pixelCurrentColor = getPixelColor(x, y);

// SNAPSHOT
function download() {
    var dt = c.toDataURL('image/jpeg');
    this.href = dt;
};
downloadLnk.addEventListener('click', download, false);

// RGB to HSL
function rgb2hsl(rgbArr){
    var r1 = rgbArr[0] / 255;
    var g1 = rgbArr[1] / 255;
    var b1 = rgbArr[2] / 255;
 
    var maxColor = Math.max(r1,g1,b1);
    var minColor = Math.min(r1,g1,b1);
    //Calculate L:
    var L = (maxColor + minColor) / 2 ;
    var S = 0;
    var H = 0;
    if(maxColor != minColor){
        //Calculate S:
        if(L < 0.5){
            S = (maxColor - minColor) / (maxColor + minColor);
        }else{
            S = (maxColor - minColor) / (2.0 - maxColor - minColor);
        }
        //Calculate H:
        if(r1 == maxColor){
            H = (g1-b1) / (maxColor - minColor);
        }else if(g1 == maxColor){
            H = 2.0 + (b1 - r1) / (maxColor - minColor);
        }else{
            H = 4.0 + (r1 - g1) / (maxColor - minColor);
        }
    }
 
    L = L * 100;
    S = S * 100;
    H = H * 60;
    if(H<0){
        H += 360;
    }
    var result = [H, S, L];
    return result;
}

// Brush
class Brush {
    constructor(color, size, x, y) {
		this.color = color;
		this.sizeX = size;
		this.sizeY = size;
		this.x = x;
		this.y = y;

		this.setColor(color);
    }

    paint(){
    	ctx.fillRect(this.x, this.y, this.sizeX, this.sizeY);
        return;
    }

    setColor(color){
    	this.color = color;
    	ctx.fillStyle = color;
    	return;
    }

    setSize(x, y){
    	this.sizeX = x;
    	this.sizeY = y;
    	return;
    }

    setPos(x, y){
    	if((x > (gridSize - this.sizeX) || x < 0) || (y > (gridSize - this.sizeY) || y < 0)){
    		return;
    	}

    	this.x = x;
    	this.y = y;
    	return;
    }

    step(direction, steps){
    	switch(direction){
    		case 'up':
    			return this.setPos(this.x, (this.y - (this.sizeY * steps)));
    		break;

    		case 'right':
    			return this.setPos((this.x + (this.sizeX * steps)), this.y);
    		break;

    		case 'down':
    			return this.setPos(this.x, (this.y + (this.sizeY * steps)));
    		break;

    		case 'left':
    			return this.setPos((this.x - (this.sizeX * steps)), this.y);
    		break;

    		default:
    			return;
    		break;
    	}
    }

    getCurrentPos(){
    	return {'x':this.x, 'y':this.y};
    }

    sampleCurrentColor(){
    	let pixelSample = ctx.getImageData(this.x, this.y, 1, 1);
    	pixelSample = [
    		pixelSample.data[0],
    		pixelSample.data[1],
    		pixelSample.data[2]
    	];
    	let pixelSampleHSL = rgb2hsl(pixelSample);
    	return pixelSampleHSL;
    }
}

// Painter
class Painter extends Brush {
	constructor(color, size, x, y) {
		super(color, size, x, y);
	}

	// Not in use
	drawCross(sizeX, sizeY){
		this.setSize(sizeX, sizeY);
		this.paint();
		this.step('up', 1);
		this.paint();
		this.step('down', 2);
		this.paint();
		this.step('down', 1);
		this.paint();
		this.step('up', 2);
		this.step('right', 1);
		this.paint();
		this.step('left', 2);
		this.paint();
		this.step('right', 1);
		this.step('down', 2);
		
		return this.getCurrentPos();
	}
}

// Create the painter object
let painter = new Painter(colors[1], pixelSize, gridCenter, gridCenter);

// Random Paint
let currentSampleColor = painter.sampleCurrentColor();

setInterval(function(){
	// Paint last dot with brighter color
	nextColor = 'hsl('+currentSampleColor[0]+','+currentSampleColor[1]+'%,'+(currentSampleColor[2] + 1)+'%)';
	painter.setColor(nextColor);
	painter.paint();

	// Randomize
	randDirection = Math.ceil(Math.random() * (5 - 0) - 1);

	// Paint
	painter.step(directions[randDirection], 1);
	currentSampleColor = painter.sampleCurrentColor();
	painter.setColor(colors[1]);
	painter.paint();
}, stepInterval);