const switchHelpers = require("./helpers");
let _ = require("lodash");

function getNextMove(state, ai) {
  let freeSquares = [];
  let myPieces = [];
  let opponentPieces = [];
  for (let i = 0; i < state.board.length; i++) {
    for (let j = 0; j < state.board[i].length; j++) {
      if (state.board[i][j] === null) {
        freeSquares.push({ i, j });
      } else if (state.board[i][j].topColour === ai.colour) {
        myPieces.push({ i, j });
      } else if (state.board[i][j].topColour !== ai.colour) {
        if (
          state.board[i][j].hasFlipped == false ||
          (state.board[i][j].hasFlipped == true &&
            state.board[i][j].bottomColour === ai.colour)
        ) {
          opponentPieces.push({ i, j });
        }
      }
    }
  }

  let myShelf = state[ai.userID];

  let freeShelfSquares = [];
  for (let i = 0; i < myShelf.length; i++) {
    if (myShelf[i] !== null) freeShelfSquares.push(i);
  }

  let pieceToMove;
  let sqaureToMoveTo;

  let typesOfMoves = [];

  //   console.log("my pieces", myPieces, myPieces.length);

  if (freeShelfSquares.length > 0) typesOfMoves.push("moveFromShelf");
  if (myPieces.length > 0) typesOfMoves.push("moveAroundBoard");
  if (opponentPieces.length > 0) typesOfMoves.push("flip");

  let moveMethod =
    typesOfMoves[Math.floor(Math.random() * typesOfMoves.length)];

  //   console.log("method", typesOfMoves, moveMethod);

  if (moveMethod == "moveFromShelf") {
    // state.board = switchHelpers.resetJustFlipped(state.board);

    // if (freeShelfSquares.length === 0) return state;

    let shelfPosition =
      freeShelfSquares[Math.floor(Math.random() * freeShelfSquares.length)];
    sqaureToMoveTo =
      freeSquares[Math.floor(Math.random() * freeSquares.length)];

    pieceToMove = myShelf[shelfPosition];
    state[ai.userID][shelfPosition] = null;
  } else if (moveMethod == "moveAroundBoard") {
    // state.board = switchHelpers.resetJustFlipped(state.board);

    let pieceToMoveIdx = myPieces[Math.floor(Math.random() * myPieces.length)];
    sqaureToMoveTo =
      freeSquares[Math.floor(Math.random() * freeSquares.length)];
    pieceToMove = state.board[pieceToMoveIdx.i][pieceToMoveIdx.j];
    state.board[pieceToMoveIdx.i][pieceToMoveIdx.j] = null;
  } else if (moveMethod == "flip") {
    let pieceToFlip =
      opponentPieces[Math.floor(Math.random() * opponentPieces.length)];
    let thisPiece = state.board[pieceToFlip.i][pieceToFlip.j];
    let tempColour = thisPiece.topColour;
    thisPiece.topColour = thisPiece.bottomColour;
    thisPiece.bottomColour = tempColour;
    thisPiece.justFlipped = true;
    thisPiece.hasFlipped = true;
    return state;
  } else {
    console.log("no valid move");
  }

  //   console.log("piece to move", pieceToMove);

  let x = sqaureToMoveTo.j * (800 / 4) + 800 / 4 / 2;
  let y = sqaureToMoveTo.i * (800 / 4) + 800 / 4 / 2;

  let newPiece = new switchHelpers.Piece(
    x,
    y,
    pieceToMove.topColour,
    pieceToMove.bottomColour,
    pieceToMove.justFlipped,
    pieceToMove.hasFlipped
  );
  state.board[sqaureToMoveTo.i][sqaureToMoveTo.j] = newPiece;

  return state;
}

function getAllPossibleMove(state, player) {
  let myShelf = state[player.userID];
  let freeShelfSpots = getShelfSquares(myShelf);
  let freeBoardSquares = getFreeBoardSquares(state);

  let possibleMoves = [];

  for (const freeShelf of freeShelfSpots) {
    for (const freeBoard of freeBoardSquares) {
      possibleMoves.push({
        i: 4,
        j: freeShelf,
        i2: freeBoard.i,
        j2: freeBoard.j,
      });
    }
  }

  for (let i = 0; i < state.board.length; i++) {
    for (let j = 0; j < state.board[i].length; j++) {
      // Ad pieces to flip
      if (state.board[i][j] === null) continue;
      if (player.type === "AI") {
        if (
          state.board[i][j].topColour !== player.colour &&
          (!state.board[i][j].hasFlipped ||
            (state.board[i][j].hasFlipped &&
              state.board[i][j].bottomColour === player.colour))
        ) {
          possibleMoves.push({ i, j, i2: i, j2: j });
        }
      } else if (state.board[i][j].topColour !== player.colour) {
        possibleMoves.push({ i, j, i2: i, j2: j });
      }
      for (const freeBoard of freeBoardSquares) {
        if (state.board[i][j].topColour === player.colour) {
          possibleMoves.push({ i, j, i2: freeBoard.i, j2: freeBoard.j });
        }
      }
    }
  }

  return possibleMoves;
}

function makeMove(state, move, player) {
  if (!(move.i === move.i2 && move.j === move.j2)) {
    // console.log("moved", move);

    if (move.i == 4) {
      let x = move.j2 * (800 / 4) + 800 / 4 / 2;
      let y = move.i2 * (800 / 4) + 800 / 4 / 2;
      oldPiece = state[player.userID][move.j];
      state[player.userID][move.j] = null;
      let newPiece = new switchHelpers.Piece(
        x,
        y,
        oldPiece.topColour,
        oldPiece.bottomColour,
        oldPiece.justFlipped,
        oldPiece.hasFlipped
      );
      state.board[move.i2][move.j2] = newPiece;
    } else if (move.i2 == 4) {
      const x = (800 - 20) / 5;
      const X = x * move.j2 + x / 2 + 20 / 2;
      const Y = 1000 - (1000 - 800) / 2;
      oldPiece = state.board[move.i][move.j];
      state.board[move.i][move.j] = null;
      let newPiece = new switchHelpers.Piece(
        X,
        Y,
        oldPiece.topColour,
        oldPiece.bottomColour,
        oldPiece.justFlipped,
        oldPiece.hasFlipped
      );
      state[player.userID][move.j2] = newPiece;
    } else {
      let x = move.j2 * (800 / 4) + 800 / 4 / 2;
      let y = move.i2 * (800 / 4) + 800 / 4 / 2;
      oldPiece = state.board[move.i][move.j];
      state.board[move.i][move.j] = null;
      let newPiece = new switchHelpers.Piece(
        x,
        y,
        oldPiece.topColour,
        oldPiece.bottomColour,
        oldPiece.justFlipped,
        oldPiece.hasFlipped
      );
      state.board[move.i2][move.j2] = newPiece;
    }
  } else {
    // console.log("flip", move, move.i === move.i2, move.j === move.j2);
    let thisPiece = state.board[move.i][move.j];
    let tempColour = thisPiece.topColour;
    thisPiece.topColour = thisPiece.bottomColour;
    thisPiece.bottomColour = tempColour;
    thisPiece.justFlipped = true;
    // thisPiece.hasFlipped = false;
  }

  return state;
}

function getShelfSquares(myShelf) {
  let freeShelfSpots = [];
  for (let i = 0; i < myShelf.length; i++) {
    if (myShelf[i] !== null) freeShelfSpots.push(i);
  }
  return freeShelfSpots;
}

function getFreeBoardSquares(state) {
  let freeSquares = [];
  for (let i = 0; i < state.board.length; i++) {
    for (let j = 0; j < state.board[i].length; j++) {
      if (state.board[i][j] === null) {
        freeSquares.push({ i, j });
      }
    }
  }
  return freeSquares;
}

function getBestMove(state, ai, human) {
  let bestScore = -Infinity;

  let stateCopy = _.cloneDeep(state);

  let possibleMoves = getAllPossibleMove(stateCopy, ai);

  let freeBoardSquares = getFreeBoardSquares(state);

  console.log("freeBoardSquares", freeBoardSquares.length);

  let d = 2;
  if (freeBoardSquares.length < 13) {
    d = 3;
  }

  for (let move of possibleMoves) {
    stateCopy = makeMove(stateCopy, move, ai);

    let { score } = minimax(
      stateCopy,
      ai,
      human,
      d,
      -Infinity,
      Infinity,
      false
    );

    move.score = score;
    // move.nMoves = nMoves;

    const { i, j, i2, j2 } = Object.assign({}, move);
    stateCopy = makeMove(stateCopy, { i: i2, j: j2, i2: i, j2: j }, ai);

    if (score > bestScore) {
      bestScore = score;
    }
  }

  const sorted = _.orderBy(possibleMoves, "score", "desc");

  const allHighest = _.filter(sorted, { score: sorted[0].score });

  let chosenMove = allHighest[Math.floor(Math.random() * allHighest.length)];

  sorted.shift();

  if (
    ai.lastMove !== undefined &&
    chosenMove.i === ai.lastMove.i &&
    chosenMove.j === ai.lastMove.j &&
    chosenMove.i2 == ai.lastMove.i2 &&
    chosenMove.j2 == ai.lastMove.j2
  ) {
    console.log(chosenMove, ai.lastMove);
    chosenMove = sorted.shift();
  }
  // console.log("sorted moves", sorted);
  // console.log("all higest", allHighest);
  // console.log("chosenMove", chosenMove);
  // console.log("best move", bestMove, bestScore);

  state = makeMove(state, chosenMove, ai);

  return { state, lastMove: chosenMove };
}

function minimax(state, ai, human, depth, alpha, beta, isMaximising) {
  const score = switchHelpers.calculateColourScores(state.board, ai.colour);

  if (score == 300 || score == -300 || depth == 0) {
    return { score };
  }

  if (isMaximising) {
    let bestScore = -Infinity;

    const possibleMoves = getAllPossibleMove(state, ai);

    for (const move of possibleMoves) {
      state = makeMove(state, move, ai);

      let { score } = minimax(state, ai, human, depth - 1, alpha, beta, false);
      score += 2 * depth;

      const { i, j, i2, j2 } = Object.assign({}, move);
      state = makeMove(state, { i: i2, j: j2, i2: i, j2: j }, ai);

      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) {
        break;
      }
    }

    return { score: bestScore };
  } else {
    let bestScore = Infinity;

    const possibleMoves = getAllPossibleMove(state, human);

    for (const move of possibleMoves) {
      state = makeMove(state, move, human);

      let { score } = minimax(state, ai, human, depth - 1, alpha, beta, true);
      //   console.log("human score", score);

      const { i, j, i2, j2 } = Object.assign({}, move);
      state = makeMove(state, { i: i2, j: j2, i2: i, j2: j }, human);

      score -= 2 * depth;

      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) {
        break;
      }
    }

    return { score: bestScore };
  }

  //   return score;
}

module.exports = { getNextMove, getBestMove };
