(function() {

  //declare required variables to create canvas, grid, and implement ant movements
  var canvas;
  var grid;
  var ctx;
  var cellSize = 5;
  var numCellsWidth = 260;
  var numCellsHeight = 150;
  var width = numCellsWidth * cellSize;
  var height = numCellsHeight * cellSize;

  var TOP = 0;
  var RIGHT = 1;
  var BOTTOM = 2;
  var LEFT = 3;

  var ants;
  var antGrid = [];
  var numberOfAnts = 0;
  var steps = 0;
  var isPaused = false;

  const speedSlider = document.getElementById("speed-slider");
  const volumeSlider = document.getElementById("volume-slider");
  const pauseButton = document.getElementById("btn-pause");
  const downloadButton = document.getElementById('download-button');
  const resetButton = document.getElementById("btn-reset");
  const pdfButton = document.getElementById("generate-pdf-button");
  const antCounter = document.getElementById("ant-counter");
  const jsPDF = window.jspdf.jsPDF;

  var frameLength = 1000 / speedSlider.value;

  //setup the canvas and initialize the variables for cellular automaton
  function setup() {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Clear the grid
    grid = [];
    for (var i = 0; i < numCellsHeight; i++) {
      row = [];
      for (var j = 0; j < numCellsWidth; j++)
        row.push('white');
      grid.push(row);
    }

    // Clear the ants
    ants = [];
    numberOfAnts = 0;
    for (let i = 0; i < antGrid.length; i++)
      antGrid[i].fill(0);

    steps = 0;
    isPaused = false;
    pauseButton.textContent = "Pause";

    ctx.clearRect(0, 0, width, height);
    drawGrid();
    gameLoop();
  }

  //create the event handler for the canvas and control the ants' movements
  $(document).ready(function() {
    $('canvas').click(function(e) {
      if (!isPaused) {
        var $el = $(this);
        var relativeX = e.pageX - $el.offset().left;
        var relativeY = e.pageY - $el.offset().top;
        var x = Math.floor(relativeX / cellSize);
        var y = Math.floor(relativeY / cellSize);

        ants.push(new Ant(x, y));
        if (ants.length > 0) {
          document.getElementById("btn-pause").disabled = false;
          pdfButton.disabled = false;
        }
      }
    });
  });

  //create 2d array for grid
  function createGrid(numCellsWidth, numCellsHeight) {
    let grid = [];
    for (let i = 0; i < numCellsHeight; i++) {
      let row = [];
      for (let j = 0; j < numCellsWidth; j++)
        row.push('white');
      grid.push(row);
    }
    return grid;
  }

  for (var y = 0; y < numCellsHeight; y++)
    antGrid.push(new Array(numCellsWidth).fill(0));


  //draw cells on the grid
  function drawCell(colour, x, y) {
    ctx.fillStyle = colour;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * cellSize + 0.5, y * cellSize + 0.5, cellSize, cellSize);
  }

  //draw ant image on cell
  function drawImage(image, x, y, width, height) {
    ctx.drawImage(image, x * cellSize, y * cellSize, width * cellSize, height * cellSize);
  }

  //draw the grid on canvas
  function drawGrid() {
    ctx.clearRect(0, 0, width, height);
    grid.forEach(function(row, y) {
      row.forEach(function(colour, x) {
        drawCell(colour, x, y);
      });
    });
  }

  //draw ants on the canvas
  function draw() {
    ants.forEach(function(ant) {
      ant.draw();
    });
  }

  //update the movements of the ant
  function update() {
    ants.forEach(function(ant) {
      ant.move();
    });
  }

  //continue the game by drawing and updating the movements of ants
  function gameLoop() {
    if (!isPaused) {
      draw();
      update();
      setTimeout(gameLoop, frameLength);
    }
    var stepCounter = document.getElementById("step-counter");
    stepCounter.textContent = steps;
  }

  //Ant constructor to create an ant object
  function Ant(x, y) {
    this.x = x;
    this.y = y;
    this.prevX = x;
    this.prevY = y;
    this.direction = RIGHT;
    this.images = {
      [TOP]: new Image(),
      [RIGHT]: new Image(),
      [BOTTOM]: new Image(),
      [LEFT]: new Image(),
    };
    this.images[TOP].src = 'ant_top.JPG';
    this.images[RIGHT].src = 'ant_right.JPG';
    this.images[BOTTOM].src = 'ant_bottom.JPG';
    this.images[LEFT].src = 'ant_left.JPG';
    this.angle = 0; // initial angle of the ant image is 0
    this.stepsTaken = 0;
    this.timeCreated = new Date();
    numberOfAnts++;
  }

  //function to create ant on the canvas by click event on canvas
  Ant.prototype.draw = function() {
    ctx.save();
    var colour = grid[this.prevY][this.prevX];
    drawCell(colour, this.prevX, this.prevY);

    var image = this.images[this.direction];
    drawImage(image, this.x, this.y, 1, 1);

    ctx.restore();

    canvas.addEventListener("click", (e) => {
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var clickedAnt = ants.find((ant) => {
        return (x >= ant.x * cellSize && x < (ant.x + 1) * cellSize &&
          y >= ant.y * cellSize && y < (ant.y + 1) * cellSize);
      });
      if (clickedAnt === this) {
        ants.push(new Ant(startX, startY, antId));
        antId++;
        numberOfAnts++;
        steps = 0; // reset steps when adding a new ant
      }
    });
  };

  //move function for the ants which uses langton's rules to decide the movements of the ants on grid
  Ant.prototype.move = function() {
    this.stepsTaken++;
    steps++;
    this.prevX = this.x;
    this.prevY = this.y;

    var currentColour = grid[this.y][this.x];
    if (currentColour == '#1ABC9C') {
      this.direction = (this.direction + 3) % 4;
      grid[this.y][this.x] = '#F4D03F';
    } else {
      this.direction = (this.direction + 1) % 4;
      grid[this.y][this.x] = '#1ABC9C';
    }
    antGrid[this.y][this.x] = 1;

    switch (this.direction) {
      case TOP:
        this.y -= 1;
        if (this.y < 0) {
          this.y = numCellsHeight - 1;
        }
        break;
      case RIGHT:
        this.x += 1;
        if (this.x >= numCellsWidth) {
          this.x = 0;
        }
        break;
      case BOTTOM:
        this.y += 1;
        if (this.y >= numCellsHeight) {
          this.y = 0;
        }
        break;
      case LEFT:
        this.x -= 1;
        if (this.x < 0) {
          this.x = numCellsWidth - 1;
        }
        break;
    }
    // Check if there was any movement and enable download button
    var currentX = this.x * cellSize;
    var currentY = this.y * cellSize;
    if (currentX !== this.prevX || currentY !== this.prevY)
      document.getElementById('download-button').disabled = false;

    playAudio();
  };

  //play sound
  function playAudio() {
    const sound = new Audio('./eatpellet.ogg');
    sound.volume = 10 * (numberOfAnts / 100) * (volumeSlider.value / 100);
    sound.play();
  }

  //function to manage the speed of ants' movements
  speedSlider.addEventListener("input", () => {
    frameLength = 1000 / speedSlider.value;
  });

  //update the number of ants in top bar
  document.addEventListener("DOMContentLoaded", () => {
    setInterval(() => {
      antCounter.textContent = numberOfAnts;
    }, 100);
  });

  //event listener to pause or resume the movements
  pauseButton.addEventListener("click", () => {
    if (pauseButton.textContent === "Pause") {
      isPaused = true;
      pauseButton.textContent = "Resume";
    } else {
      isPaused = false;
      pauseButton.textContent = "Pause";
      gameLoop();
    }
  });

  //event listener to reset the movements and everything to default
  resetButton.addEventListener("click", () => {
    ants = [];
    numberOfAnts = 0;
    steps = 0;

    grid = createGrid(numCellsWidth, numCellsHeight);

    for (let i = 0; i < antGrid.length; i++)
      antGrid[i].fill(0);

    pauseButton.disabled = true;
    downloadButton.disabled = true;    
    volumeSlider.value = 50;
    speedSlider.value = 5;

    ctx.clearRect(0, 0, width, height);
    drawGrid();
    isPaused = false;
    pauseButton.textContent = "Pause";
    pdfButton.disabled = true;
    
    frameLength = 600;
    gameLoop();
  });

  //function to which creates similar grid and download the image of all movements of all ants on the grid
  function downloadGrid() {
    let minX = numCellsWidth - 1;
    let maxX = 0;
    let minY = numCellsHeight - 1;
    let maxY = 0;
    for (let y = 0; y < numCellsHeight; y++) {
      for (let x = 0; x < numCellsWidth; x++) {
        if (grid[y][x] === '#FF0000' || grid[y][x] === '#00A300' || grid[y][x] === '#1ABC9C' || grid[y][x] === '#F4D03F') {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    // Create a new canvas element with the size of the visited cells
    const downloadCanvas = document.createElement('canvas');
    downloadCanvas.width = (maxX - minX + 1) * cellSize;
    downloadCanvas.height = (maxY - minY + 1) * cellSize;

    // Get the 2D context of the canvas
    const downloadCtx = downloadCanvas.getContext('2d');

    // Loop through the visited cells and draw them with borders
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (grid[y][x] === '#FF0000') {
          downloadCtx.fillStyle = '#00A300';
        } else if (grid[y][x] === '#00A300') {
          downloadCtx.fillStyle = '#FF0000';
        } else if (grid[y][x] === '#1ABC9C') {
          downloadCtx.fillStyle = '#F4D03F';
        } else if (grid[y][x] === '#F4D03F') {
          downloadCtx.fillStyle = '#1ABC9C';
        } else {
          continue;
        }
        downloadCtx.fillRect((x - minX) * cellSize, (y - minY) * cellSize, cellSize, cellSize);
        downloadCtx.strokeStyle = 'black';
        downloadCtx.lineWidth = 1;
        downloadCtx.strokeRect((x - minX) * cellSize, (y - minY) * cellSize, cellSize, cellSize);
      }
    }
    // Convert the canvas element to an image
    const imageDataURL = downloadCanvas.toDataURL('image/png');

    // Create a link element and set its attributes to download the image
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', imageDataURL);
    downloadLink.setAttribute('download', 'ant-movement.png');

    // Click the link to download the image
    downloadLink.click();
  }
  //event listener for download button
  downloadButton.addEventListener('click', downloadGrid);
 
 //event listener for download pdf of ant movements
 document.addEventListener('DOMContentLoaded', function() {
  const generateButton = document.getElementById('generate-pdf-button');
  generateButton.addEventListener('click', generatePDF);
});

  //function to generate pdf of details of each ant's steps taken and time elapsed since creation
  function generatePDF() {
    const doc = new jsPDF();
    const date = new Date();

    // Calculate elapsed time for each ant
    ants.forEach((ant) => {
      ant.elapsedTime = Math.floor((date.getTime() - ant.timeCreated.getTime()) / 1000);
    });

    // Create a new page for every 3 ants
    const antsPerPage = 8;
    let currentPage = 1;
    for (let i = 0; i < ants.length; i += antsPerPage) {
      if (i !== 0) {
        doc.addPage();
        currentPage++;
      }
      ants.slice(i, i + antsPerPage).forEach((ant, index) => {
        const yPos = 20 + (index * 35);
        doc.text(`Ant ${i + index + 1}`, 10, yPos + 10);
        doc.text(`Steps taken: ${ant.stepsTaken}`, 20, yPos + 20);
        doc.text(`Time Elapsed: ${ant.elapsedTime} seconds`, 20, yPos + 30);
        doc.line(10, yPos + 35, 200, yPos + 35);
      });

      // Add page number
      doc.text(`Page ${currentPage}`, doc.internal.pageSize.getWidth() - 20, 10);
    }

    // Save and open the PDF in a new tab
    const pdfOutput = doc.output();
    const blob = new Blob([pdfOutput], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    doc.save('langtons-ant.pdf');
  }
  
  //call to function to create canvas and grids
  setup();

})();