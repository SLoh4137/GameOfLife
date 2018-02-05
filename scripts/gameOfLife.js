var board = {};

function startGame() {
	var width = document.getElementById("gameWidth").value,
		height = document.getElementById("gameHeight").value,
		squareSize = document.getElementById("squareSize").value,
		numTeams = parseInt(document.getElementById("numTeams").value) + 1,

		teams = [],
		canvas = document.getElementById("game"),
		boundingRect = {},
		context = {};
		
	//Begin initialization
	
	canvas.width = width;
	canvas.height = height;
	canvas.style = "border:1px solid #000000";
	
	boundingRect = canvas.getBoundingClientRect();
	context = canvas.getContext("2d");
	
	teams[0] = "white";
	for(var i = 1; i < numTeams; i++) {
		teams[i] = document.getElementById("team" + i).value;
	}
	
	//document.body.insertBefore(canvas, document.body.childNodes[0]);
	
	board = {
		data: createBlankArray(width, height),
		state: false,
		paused: false,
		
		pause: function() {
			if(this.paused) {
				this.paused = false;
				document.getElementById('pauseButton').innerText = 'PAUSE';
			} else {
				this.paused = true;
				document.getElementById('pauseButton').innerText = 'START';
			}
		},
		
		
		update: function() {
			var x, y;
			var flipState = (this.state + 1) % 2;
			var ctx = context;
			
			for(x = 0; x < width; x++) {
			  for(y = 0; y < height; y++) {
				  
				let left = x - 1, right = x + 1, up = y - 1, down = y + 1,
					liveCount = 0, curCell = this.data[x][y], colors = [];
					
				var max = 0, maxIndex = 0;
		
				for(var count = 0; count < numTeams; count++) {
					colors[count] = 0;
				}
				
				//Get the pos of nearby cells. If at edge, wraps around
				if(left < 0) left = width - 1;
				if(right >= width) right = 0;
				if(up < 0) up = height - 1;
				if(down >= height) down = 0;
					
				//Left, Right, Up, Down
				colors[this.data[left][y][this.state]]++;
				colors[this.data[right][y][this.state]]++;
				colors[this.data[x][up][this.state]]++;
				colors[this.data[x][down][this.state]]++;
				
				//Corners
				colors[this.data[left][up][this.state]]++;
				colors[this.data[left][down][this.state]]++;
				colors[this.data[right][up][this.state]]++;
				colors[this.data[right][down][this.state]]++;
				
				liveCount = 8 - colors[0];
						
				//Check if the current cell should be alive
				if(liveCount === 3 || (liveCount === 2 && curCell[this.state] != 0)) {
					
					//Determine which color to adopt
					for(var count = 1; count < numTeams; count++) {
						let currentValue = colors[count];
						if(currentValue > max) {
							max = currentValue;
							maxIndex = count;
						
							if(max >= liveCount) break;
						}
					}
				
				  curCell[flipState] = maxIndex;
				} else {
				  curCell[flipState] = 0;
				}
				
				//If the current state is different than previous, change color
				if(curCell[this.state] != curCell[flipState]) {
					ctx.fillStyle = teams[maxIndex];
					ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize); 
				}
				
				
			  }
			}
			
			this.state = flipState;
		},
		
		updateCell: function (x, y, color) {
			this.data[x][y][this.state] = color;
			context.fillStyle = teams[color];
			context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize); 
		},
		
		createPoints: function (numPoints) {
			var i;
	
			for(i = 0; i < numPoints; i++) {
				let x = Math.floor(Math.random() * width / squareSize),
					y = Math.floor(Math.random() * height / squareSize),
					random = Math.floor(Math.random() * numTeams);

				board.updateCell(x, y, random);
			}
		},
		
	}
	
	setInterval(updateGameArea, 1000);
	//Add a listener for mouse clicks	
	window.addEventListener('mousedown', function(e) {
		let x = e.clientX, y = e.clientY, boundingRect = canvas.getBoundingClientRect(),
			color = document.getElementById("teams").elements.namedItem("selectedColor").value;
		if(x > boundingRect.right || y > boundingRect.bottom) {
			return;
		}
		
		indexX = Math.floor((x - boundingRect.left) / squareSize);
		indexY = Math.floor((y - boundingRect.top) / squareSize);
		board.updateCell(indexX, indexY, color);
	});
}

function updateGameArea() {
	if(board.paused) {
		return;
	}
  board.update();
}

/*
* rows is y, cols is x
*/
function createBlankArray(width, height) {
	var blankBoard = [], x, y;

	for(x = 0; x < width; x++) {
		blankBoard[x] = [];
		for(y = 0; y < height; y++) {
			blankBoard[x][y] = [false, false];
		}
	}

	return blankBoard;
}

function createTeamOptions() {
	let i, teamsDiv = document.getElementById("teams"), numTeams = parseInt(document.getElementById("numTeams").value) + 1;
	teamsDiv.innerHTML = "";
	
	for(i = 1; i < numTeams; i++) {
		let team = document.createElement("input"), 
			label = document.createElement("label"),
			radioButton = document.createElement("input"),
			color = rainbow(numTeams, i + 1);
			
		if(i === 1) {
			color = "black";
			radioButton.checked = true;
		}	
		
		team.setAttribute("type", "color");
		team.setAttribute("id", "team" + i);
		team.setAttribute("value", color);
		
		label.setAttribute("for", "team" + i);
		label.innerHTML = "Team " + i + ": ";
		
		radioButton.setAttribute("type", "radio");
		radioButton.setAttribute("value", i);
		radioButton.setAttribute("name", "selectedColor");
		
		
		teamsDiv.appendChild(label);
		teamsDiv.appendChild(team);
		teamsDiv.appendChild(radioButton);
		teamsDiv.appendChild(document.createElement("br"));
	}
}


/* Obtained from: https://stackoverflow.com/questions/1484506/random-color-generator 
* Credit to Adam Cole
*/
function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    let r, g, b;
    let h = step / numOfSteps;
    let i = ~~(h * 6);
    let f = h * 6 - i;
    let q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    let c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}

