// painterBot v0.2 by DodgeCode
// This is an experimental artwork paint by randomness

// ######
// Config
// ######

// Colors
let colors = {
	'grid': 'rgb(4,74,86)',
	'painter': 'rgb(216,54,64)',
	'hunter': 'rgb(242,255,0)',
	'wall': 'rgb(76,59,0)',
	'dot': 'rgb(38,36,57)',
	'dot2': 'rgb(22,89,107)',
	'dot3': 'rgb(69,176,166)'
};

// Grid
let grid = {
	'pixelSize': 4, // Pixels
	'gridSizeX': "1280", // Pixels
	'gridSizeY': "720", // Pixels
	'painterSpeed': 0.0001, // Milliseconds
	'hunterSpeed': 50, // Milliseconds
	'directions': ['up', 'down', 'left', 'right']
}

// Targets list
let = targetsList = [];

// Create canvas
let gridCenterX = grid.gridSizeX/2;
let gridCenterY = grid.gridSizeY/2;
let c = document.getElementById("grid");
let ctx = c.getContext("2d");
ctx.canvas.width  = grid.gridSizeX;
ctx.canvas.height = grid.gridSizeY;
ctx.fillStyle = colors.grid;
ctx.fillRect(0,0,grid.gridSizeX,grid.gridSizeY);


// COLOR PICK
function getPixelColor(x, y) {
    var pxData = ctx.getImageData(x,y,1,1);
    return("rgb("+pxData.data[0]+","+pxData.data[1]+","+pxData.data[2]+")");
}

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
        this.sampleCurrentColor();
    }

    paint(color=null){
    	if(color !== null){
    		ctx.fillStyle = color;
    	}
    	ctx.fillRect(this.x, this.y, this.sizeX, this.sizeY);
        return;
    }

    setColor(color){
    	ctx.fillStyle = color;
    	return;
    }

    setSize(x, y){
    	this.sizeX = x;
    	this.sizeY = y;
    	return;
    }

    setPos(x, y){
    	if((x > (grid.gridSizeX - this.sizeX) || x < 0) || (y > (grid.gridSizeY - this.sizeY) || y < 0)){
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

    getX(){
    	return this.x;
    }

    getY(){
    	return this.y;
    }

    sampleCurrentColor(){
    	let pixelSample = ctx.getImageData(this.x, this.y, 1, 1);
    	pixelSample = [
    		pixelSample.data[0],
    		pixelSample.data[1],
    		pixelSample.data[2]
    	];

    	let pixelSampleHSLArray = rgb2hsl(pixelSample);
    	let pixelSampleHSL = 'hsl('+pixelSampleHSLArray[0]+','+pixelSampleHSLArray[1]+'%,'+(pixelSampleHSLArray[2])+'%)';
    	let pixelSampleHSLBrighter = 'hsl('+pixelSampleHSLArray[0]+','+pixelSampleHSLArray[1]+'%,'+(pixelSampleHSLArray[2] + 1)+'%)';
    	let pixelSampleRGB = 'rgb('+pixelSample[0]+','+pixelSample[1]+','+pixelSample[2]+')';
    	
    	if(pixelSampleRGB !== colors.hunter && pixelSampleRGB !== colors.painter){
	        this.nextColor = pixelSampleHSLBrighter;
    	}

    	return pixelSampleHSLArray;
    }

    paintStep(direction, step){
        // Paint last dot with brighter color
        this.setColor(this.nextColor);
        this.paint();

        // Paint
        this.step(direction, step);
        this.sampleCurrentColor();
        this.setColor(this.color);
        this.paint();
        return;
    }

    wipeStep(direction, steps){
        // Paint last dot with grid color
        this.setColor(colors.grid);
        this.paint();

        // Step
        this.step(direction, steps);

        // Paint
        this.setColor(this.color);
        this.paint();
        return;
    }
}

// Painter
class Painter extends Brush {
	constructor(color, size, x, y) {
		super(color, size, x, y);
        this.health = 'alive';
		targetsList.push(this);
	}

	randWalk(steps){
		this.walkInterval = setInterval(
			() => this.randStep(steps)
		, grid.hunterSpeed);
		return;
	}

	randStep(steps){
		this.randDirection = Math.ceil(Math.random() * (5 - 0) - 1);
		this.paintStep(grid.directions[this.randDirection], steps);
		return;
	}

	stopWalking(){
		clearInterval(this.walkInterval);
		return;
	}

	getHealth(){
		return this.health;
	}

	die(){
		this.stopWalking();
		this.paint(colors.grid);
		targetsList.shift();
        this.health = 'dead';
		return;
	}
}

// Hunter
class Hunter extends Brush {
	constructor(color, size, x, y) {
		super(color, size, x, y);
	}

	stepCloser(target, steps){
		if(target.getHealth() === 'dead'){
			return this.searchForTarget();
		}

		let distanceX = Math.abs(target.getX() - this.getX());
		let distanceY = Math.abs(target.getY() - this.getY());

    	if(target.getX() < this.getX() && target.getY() < this.getY()){ // If top left
    		if(distanceX >= distanceY){
    			this.wipeStep('left', steps);
    		} else {
    			this.wipeStep('up', steps);
    		}
    	} else if(target.getX() > this.getX() && target.getY() < this.getY()) { // If top right
    		if(distanceX >= distanceY){
    			this.wipeStep('right', steps);
    		} else {
    			this.wipeStep('up', steps);
    		}
    	} else if(target.getX() < this.getX() && target.getY() > this.getY()) { // If bottom left
    		if(distanceX >= distanceY){
    			this.wipeStep('left', steps);
    		} else {
    			this.wipeStep('down', steps);
    		}
		} else if(target.getX() > this.getX() && target.getY() > this.getY()) { // If bottom right
			if(distanceX >= distanceY){
				this.wipeStep('right', steps);
			} else {
				this.wipeStep('down', steps);
			}
		} else if(distanceX == 0 && distanceY == 0){ // BOOM!
			if(target != undefined){
				return this.caught(target);
			}
		}
		return;
    }

	chase(target, steps){
		this.chaseInterval = setInterval(
			() => this.stepCloser(target, steps)
		, grid.hunterSpeed);
		return;
	}

	stopChase(){
		clearInterval(this.chaseInterval);
		return;
	}


	caught(target){
		this.stopChase();
		this.terminateTarget(target);
		this.searchForTarget();
		return;
	}

	searchForTarget(){
		// Find new target
		let newTarget = targetsList[0];
		
		// Chase target if exist
		if(newTarget !== undefined){
			this.stopChase();
			clearInterval(this.wait);
			this.wait = null;
			this.chase(newTarget, 1);
		} else {
			this.waitForPrey();
		}
		return;
	}

	waitForPrey(){
		if(typeof this.wait !== 'number'){
			this.wait = setInterval(
				() => this.searchForTarget()
			, 500);
		}
		return;
	}

	terminateTarget(target){
		// Kill target
		target.die();

		// Search for new target
		this.searchForTarget();
		return;
	}

	getTargetHealth(target){
		return target.getHealth();
	}

	die(){
		this.stopChase();
		this.paint(colors.grid);
		return;
	}
}

// Create the painter object
let painter = new Painter(colors.painter, grid.pixelSize, gridCenterX, gridCenterY);

// Create new painter on click
c.addEventListener("mousedown", mouseClick, false);

// On mouse click
function mouseClick(event){
	if(window.event.ctrlKey){ // CTRL + CLICK
		addHunter(event);
	} else { // CLICK ONLY
		addPainter(event);
	}
}

// Add Painter
function addPainter(event){
	let mouseX = 0;
	let mouseY = 0;

	// Get mouse position
	let rect = c.getBoundingClientRect();
	mouseX = event.clientX - Math.ceil(rect.left),
	mouseY = event.clientY - Math.ceil(rect.top)

	// Round to grid
	mouseX = Math.ceil(mouseX / grid.pixelSize) * grid.pixelSize;
	mouseY = Math.ceil(mouseY / grid.pixelSize) * grid.pixelSize;

	// Create rand color for painter
	let randRed = Math.ceil(Math.random() * (255 - 0) - 0);
	let randGreen = Math.ceil(Math.random() * (255 - 0) - 0);
	let randBlue = Math.ceil(Math.random() * (255 - 0) - 0);
	let randRGB = `rgb(${randRed},${randGreen},${randBlue})`;

	// New painter
	let painter = new Painter(colors.painter, grid.pixelSize, mouseX+grid.pixelSize, mouseY);

	painter.randWalk(1);
	return;
}

// Add Hunter
function addHunter(event){
	let mouseX = 0;
	let mouseY = 0;

	// Get mouse position
	let rect = c.getBoundingClientRect();
	mouseX = event.clientX - Math.ceil(rect.left);
	mouseY = event.clientY - Math.ceil(rect.top);

	// Round to grid
	mouseX = Math.ceil(mouseX / grid.pixelSize) * grid.pixelSize;
	mouseY = Math.ceil(mouseY / grid.pixelSize) * grid.pixelSize;

	// New Hunter
	let hunter = new Hunter(colors.hunter, grid.pixelSize, gridCenterX, gridCenterY);

	// Set position and color
	hunter.setPos(mouseX, mouseY);

	// Find target for hunter
	let newTarget = targetsList[0];
	
	// Chase target if exist
	if(newTarget !== undefined){
		hunter.chase(newTarget, 1);
	}
	return;
}

// Start with one painter walking
painter.randWalk(1);