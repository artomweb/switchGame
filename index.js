let board;
let boardPieces = [];
let dragging = false;
let draggingPiece;
let boxWidth;
let boxHeight;
let dragStart;
let dragDistance = 5;

function setup() {
  canvas = createCanvas(800, 1000);
  canvas.parent("sketch");

  board = new Board();

  boxWidth = width / 4;
  boxHeight = board.boardHeight / 4;
}

function createPieces(top, bottom) {
  for (let i = 0; i < 5; i++) {
    let x = (board.boardWidth - board.btmSp) / 5;
    let X = x * i + x / 2 + board.btmSp / 2;
    let Y = height - (height - board.boardHeight) / 2;
    let thisPiece;
    if (i == 0 || i == 1) {
      thisPiece = new Piece(X, Y, top, bottom);
    } else {
      thisPiece = new Piece(X, Y, top, top);
    }
    boardPieces.push(thisPiece);
  }
}

function draw() {
  clear();
  background("lightpink");
  //   console.log("drawing");

  board.drawBoard();

  if (!gameID) return;

  for (let i = 0; i < boardPieces.length; i++) {
    boardPieces[i].drawPiece();
  }

  if (dragging && myTurn) {
    let newDragPos = new p5.Vector(mouseX, mouseY);
    if (newDragPos.dist(dragStart) > dragDistance) {
      draggingPiece.pos.x = mouseX;
      draggingPiece.pos.y = mouseY;
    }
  }

  for (let i = 0; i < serverBoard.length; i++) {
    for (let j = 0; j < serverBoard[i].length; j++) {
      //&& serverBoard[i][j].owner !== myID
      if (serverBoard[i][j] !== null) {
        let thisPiece = serverBoard[i][j];
        push();
        fill("white");
        circle(thisPiece.pos.x, thisPiece.pos.y, thisPiece.r);

        fill(thisPiece.topColour);
        circle(thisPiece.pos.x, thisPiece.pos.y, thisPiece.r - thisPiece.r / 5);
        pop();
      }
    }
  }
}

function doubleClicked() {
  if (!myTurn) return;
  for (let i = 0; i < boardPieces.length; i++) {
    if (dist(boardPieces[i].pos.x, boardPieces[i].pos.y, mouseX, mouseY) < boardPieces[i].r / 2) {
      console.log("doubleClicked", boardPieces[i]);
    }
  }
}

function mousePressed() {
  if (!myTurn) return;
  dragStart = new p5.Vector(mouseX, mouseY);
  for (let i = 0; i < boardPieces.length; i++) {
    if (dist(boardPieces[i].pos.x, boardPieces[i].pos.y, mouseX, mouseY) < boardPieces[i].r / 2) {
      dragging = true;
      draggingPieceIndex = i;
      draggingPiece = boardPieces[i];
      console.log("started dragging");
    }
  }

  for (let i = 0; i < serverBoard.length; i++) {
    for (let j = 0; j < serverBoard[i].length; j++) {
      if (serverBoard[i][j] !== null && dist(serverBoard[i][j].pos.x, serverBoard[i][j].pos.y, mouseX, mouseY) < serverBoard[i][j].r / 2 && serverBoard[i][j].owner == myID) {
        dragging = true;
        // draggingPieceIndex = i;
        draggingPiece = serverBoard[i][j];
        console.log("started dragging serverPiece");
      }
    }
  }
}

function mouseClicked() {
  if (!myTurn) return;
  // If the mouse was clicked and it's inside a piece which has not been moved
  let newDragPos = new p5.Vector(mouseX, mouseY);
  if (newDragPos.dist(dragStart) > dragDistance) return;
  for (let i = 0; i < serverBoard.length; i++) {
    for (let j = 0; j < serverBoard[i].length; j++) {
      if (serverBoard[i][j] !== null && dist(serverBoard[i][j].pos.x, serverBoard[i][j].pos.y, mouseX, mouseY) < serverBoard[i][j].r / 2) {
        console.log("clicked", serverBoard[i][j]);

        serverFlipPiece(serverBoard[i][j]);
      }
    }
  }
}

function movePieceBack(piece) {
  // If the piece came from the shelf then put it back on shelf
  if (piece.boardCoord == 0) {
    console.log("piece came from shelf");
    piece.pos = piece.originalPos.copy();
    piece.boardCoord = 0;
  }
  // If the piece came from the board then put it back on board
  else {
    console.log("Piece was on board, tried to move it to bad space");
    let x = piece.boardCoord.x * boxWidth + boxWidth / 2;
    let y = piece.boardCoord.y * boxHeight + boxHeight / 2;

    piece.pos = new p5.Vector(x, y);
  }
}

function mouseReleased() {
  if (!myTurn) return;
  let newDragPos = new p5.Vector(mouseX, mouseY);
  if (dragging && newDragPos.dist(dragStart) > dragDistance) {
    let insideShelf = circRect(draggingPiece.pos.x, draggingPiece.pos.y, draggingPiece.r / 2, board.shelfPos.x, board.shelfPos.y, board.shelfWidth, board.shelfHeight);
    let outsideB = outsideBoard(draggingPiece.pos.x, draggingPiece.pos.y, draggingPiece.r / 2);
    // If the piece was moved onto shelf or outside board
    if (insideShelf || outsideB) {
      movePieceBack(draggingPiece);
    }
    // If the piece was moved onto the board
    else {
      let { i, j } = getBoardCoords(draggingPiece.pos.x, draggingPiece.pos.y);
      let occupied = isOccupied(i, j, serverBoard);
      if (occupied) {
        console.log("SPACE NOT FREE");
        movePieceBack(draggingPiece);
        dragging = false;
        return;
      }
      let x = i * boxWidth + boxWidth / 2;
      let y = j * boxHeight + boxHeight / 2;
      draggingPiece.pos = new p5.Vector(x, y);
      let newPosition = new p5.Vector(i, j);
      // If the piece was moved around on the board
      if (draggingPiece.boardCoord !== 0) {
        // If the piece was moved from elsewhere then remove its last position
        if (!draggingPiece.boardCoord.equals(newPosition)) {
          console.log("piece moved from elsewhere on board");
          board.state[draggingPiece.boardCoord.y][draggingPiece.boardCoord.x] = 0;
        }
        // Else it's still in the same position
        else console.log("piece moved into same position");
        dragging = false;
        return;
      } else {
        console.log("piece placed onto board for first time");
        draggingPiece.boardCoord = newPosition;
        boardPieces.splice(draggingPieceIndex, 1);
        serverAddPiece(draggingPiece);
      }
      // Update boardCoord
      draggingPiece.boardCoord = newPosition;

      // Update main board state
      board.state[j][i] = draggingPiece;
    }
  }
  dragging = false;
}
