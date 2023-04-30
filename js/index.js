let boxWidth;
let boxHeight;

let board;
let shelfPieces = [];
let boardPieces = [];

let dragging = false;
let draggingPiece;
let draggingPieceShelfIndex;

let dragDistance = 5;

function createShelfPieces(pieces) {
  let thesePieces = [];
  for (let i = 0; i < pieces.length; i++) {
    let thisPiece = new Piece(pieces[i].x, pieces[i].y, pieces[i].topColour, pieces[i].bottomColour, true);
    thesePieces.push(thisPiece);
  }

  shelfPieces = thesePieces;
}

function createGamePieces(pieces) {
  let thesePieces = [[], [], [], []];
  for (let i = 0; i < pieces.length; i++) {
    for (let j = 0; j < pieces[i].length; j++) {
      if (pieces[i][j] === null) continue;
      let x = i * boxWidth + boxWidth / 2;
      let y = j * boxHeight + boxHeight / 2;
      let thisPiece = new Piece(x, y, pieces[i][j].topColour, pieces[i][j].bottomColour, false);
      thesePieces[i][j] = thisPiece;
    }
  }
  boardPieces = thesePieces;

  board.shelfColour = allServerData.yourColour;
}

function setup() {
  canvas = createCanvas(800, 1000);
  canvas.parent("sketch");

  board = new Board();

  boxWidth = width / 4;
  boxHeight = board.boardHeight / 4;
}

function draw() {
  background("lightpink");

  board.drawBoard();

  for (let i = 0; i < shelfPieces.length; i++) {
    shelfPieces[i].drawPiece();
  }

  for (let i = 0; i < boardPieces.length; i++) {
    for (let j = 0; j < boardPieces[i].length; j++) {
      if (boardPieces[i][j] === undefined) continue;
      boardPieces[i][j].drawPiece();
    }
  }

  if (dragging && allServerData.yourID === allServerData.nextPlayer.userID) {
    let newDragPos = new p5.Vector(mouseX, mouseY);
    if (newDragPos.dist(dragStart) > dragDistance) {
      draggingPiece.pos.x = mouseX;
      draggingPiece.pos.y = mouseY;
    }
  }
}

function mouseClicked() {
  if (!allServerData || allServerData.nextPlayer == null || allServerData.yourID !== allServerData.nextPlayer.userID) return;
  // If the mouse was clicked and it's inside a piece which has not been moved
  let newDragPos = new p5.Vector(mouseX, mouseY);
  if (newDragPos.dist(dragStart) > dragDistance) return;
  for (let i = 0; i < boardPieces.length; i++) {
    for (let j = 0; j < boardPieces[i].length; j++) {
      if (boardPieces[i][j] === null || boardPieces[i][j] === undefined) continue;
      if (boardPieces[i][j].topColour === allServerData.yourColour) continue;
      if (dist(boardPieces[i][j].pos.x, boardPieces[i][j].pos.y, mouseX, mouseY) < boardPieces[i][j].r / 2) {
        console.log("clicked on piece, ", boardPieces[i][j]);
        console.log("");
        let coords = getBoardCoords(boardPieces[i][j].pos.x, boardPieces[i][j].pos.y);
        serverMove("flip", { i: coords.i, j: coords.j });
      }
    }
  }
}

function mousePressed() {
  if (!allServerData || allServerData.nextPlayer == null || allServerData.yourID !== allServerData.nextPlayer.userID) return;
  dragStart = new p5.Vector(mouseX, mouseY);
  for (let i = 0; i < shelfPieces.length; i++) {
    if (dist(shelfPieces[i].pos.x, shelfPieces[i].pos.y, mouseX, mouseY) < shelfPieces[i].r / 2) {
      dragging = true;
      draggingPieceShelfIndex = i;
      draggingPiece = shelfPieces[i];
      console.log("started dragging shelf piece");
    }
  }

  for (let i = 0; i < boardPieces.length; i++) {
    for (let j = 0; j < boardPieces[i].length; j++) {
      if (boardPieces[i][j] === null || boardPieces[i][j] === undefined) continue;
      if (boardPieces[i][j].topColour !== allServerData.yourColour) continue;
      if (dist(boardPieces[i][j].pos.x, boardPieces[i][j].pos.y, mouseX, mouseY) < boardPieces[i][j].r / 2) {
        dragging = true;
        draggingPieceShelfIndex = -1;
        draggingPiece = boardPieces[i][j];
        draggingPiece.origin = new p5.Vector(i, j);
        console.log("started dragging board piece");
      }
    }
  }
}

function movePieceBack(piece) {
  // If the piece came from the shelf then put it back on shelf
  if (draggingPieceShelfIndex !== -1) {
    console.log("piece came from shelf");
    piece.pos = piece.originalPos.copy();
    piece.boardCoord = 0;
  }
  // If the piece came from the board then put it back on board
  else {
    console.log("Piece was on board, tried to move it to bad space");
    let { i, j } = getBoardCoords(piece.pos.x, piece.pos.y);
    let x = draggingPiece.origin.x * boxWidth + boxWidth / 2;
    let y = draggingPiece.origin.y * boxHeight + boxHeight / 2;

    piece.pos = new p5.Vector(x, y);
  }
}

function mouseReleased() {
  if (!allServerData || allServerData.nextPlayer == null || allServerData.yourID !== allServerData.nextPlayer.userID) return;
  let newDragPos = new p5.Vector(mouseX, mouseY);
  if (dragging && newDragPos.dist(dragStart) > dragDistance) {
    // If piece was moved to illegal space
    let insideShelf = circRect(draggingPiece.pos.x, draggingPiece.pos.y, draggingPiece.r / 2, board.shelfPos.x, board.shelfPos.y, board.shelfWidth, board.shelfHeight);
    let outsideB = outsideBoard(draggingPiece.pos.x, draggingPiece.pos.y, draggingPiece.r / 2);
    let { i, j } = getBoardCoords(draggingPiece.pos.x, draggingPiece.pos.y);
    let occupied = isOccupied(i, j, boardPieces);

    if (insideShelf || outsideB || occupied) {
      console.log(insideShelf, outsideB, occupied);
      movePieceBack(draggingPiece);
    } else {
      if (draggingPieceShelfIndex !== -1) {
        serverMove("add", { idx: draggingPieceShelfIndex, i, j });
        console.log("dragged shelf piece");
        shelfPieces.splice(draggingPieceShelfIndex, 1);
      } else {
        console.log("moved piece on board", draggingPiece.boardCoord);
        serverMove("move", { i1: draggingPiece.origin.x, j1: draggingPiece.origin.y, i2: i, j2: j });
      }
      let x = i * boxWidth + boxWidth / 2;
      let y = j * boxHeight + boxHeight / 2;
      draggingPiece.pos = new p5.Vector(x, y);
      draggingPiece.boardCoord = new p5.Vector(i, j);
    }
  }
  dragging = false;
}
