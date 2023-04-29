function circRect(cx, cy, rad, rx, ry, rw, rh) {
  let testX = cx;
  let testY = cy;

  if (cx < rx) testX = rx; // test left edge
  else if (cx > rx + rw) testX = rx + rw; // right edge
  if (cy < ry) testY = ry; // top edge
  else if (cy > ry + rh) testY = ry + rh; // bottom edge

  let d = dist(cx, cy, testX, testY);

  if (d <= rad) {
    return true;
  }
  return false;
}

function outsideBoard(cx, cy, rad) {
  if (cx <= 0 || cx >= width || cy <= 0 || cy >= height) return true;
  return false;
}

function getBoardCoords(x, y) {
  let boxWidth = width / 4;
  let boxHeight = board.boardHeight / 4;
  let i = floor(x / boxWidth);
  let j = floor(y / boxHeight);

  return { i, j };
}

function pointRect(x, y, rx, ry, rw, rh) {
  if (x > rx && x < rx + rw && y > ry && y < ry + rh) return true;
  return false;
}

function isOccupied(i, j, board) {
  console.log(i, j);
  console.log(board[j][i]);
  if (board[j][i] === null || board[j][i] === undefined) return false;
  return true;
}
