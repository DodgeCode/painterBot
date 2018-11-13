// Colors
let colors = [
	"#044A56", // Background
	"#D83640", // Selected
	"#262439",
	"#16596B",
	"#45B0A6"
];

directions = ['up', 'down', 'left', 'right'];

// Grid
let pixelSize = 1;
let gridSize = "600";
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
}

// Painter
class Painter extends Brush {
	constructor(color, size, x, y) {
		super(color, size, x, y);
	}

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
setInterval(function(){
	// Paint last dot
	painter.setColor(colors[4]);
	painter.paint();

	// Randomize
	randDirection = Math.ceil(Math.random() * (5 - 0) - 1);

	// Paint
	painter.step(directions[randDirection], 1);
	painter.setColor(colors[1]);
	painter.paint();
}, 1);