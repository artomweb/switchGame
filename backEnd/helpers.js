let _ = require("lodash");
class Piece {
  constructor(
    x,
    y,
    topColour,
    bottomColour,
    justFlipped = false,
    hasFlipped = false
  ) {
    this.x = x;
    this.y = y;
    this.topColour = topColour;
    this.bottomColour = bottomColour;
    this.boardCoord = 0;
    this.r = 120;
    this.boardWidth = 800;
    this.boardHeight = 800;
    this.canvasHeight = 1000;
    this.btmSp = 20;
    this.justFlipped = justFlipped;
    this.hasFlipped = hasFlipped;
  }
}

function createPieces(top, bottom) {
  let boardPieces = [];
  let boardWidth = 800;
  let boardHeight = 800;
  let canvasHeight = 1000;
  let btmSp = 20;
  for (let i = 0; i < 5; i++) {
    let x = (boardWidth - btmSp) / 5;
    let X = x * i + x / 2 + btmSp / 2;
    let Y = canvasHeight - (canvasHeight - boardHeight) / 2;
    let thisPiece;
    if (i == 0 || i == 1) {
      thisPiece = new Piece(X, Y, top, bottom);
    } else {
      thisPiece = new Piece(X, Y, top, top);
    }
    boardPieces.push(thisPiece);
  }

  return boardPieces;
}

function isGameOver(board) {
  let xs = [0, 0, 1, 1];
  let ys = [0, 1, 1, 0];
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      let allSame = true;
      if (board[x + xs[0]][y + ys[0]] == null) continue;
      let originColour = board[x + xs[0]][y + ys[0]].topColour; // if all are the same as top right
      for (let n = 0; n < 4; n++) {
        // for each corner of square mask
        if (
          board[x + xs[n]][y + ys[n]] === null ||
          board[x + xs[n]][y + ys[n]].topColour != originColour
        ) {
          allSame = false;
          break;
        }
      }
      if (allSame) {
        return originColour;
      }
    }
  }

  return false;
}

function calculateColourScores(board, colourWin) {
  let xs = [0, 0, 1, 1];
  let ys = [0, 1, 1, 0];

  let makingWinningSquares = 0;

  //   console.log(board);
  try {
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        let allSame = true;
        if (board[x + xs[0]][y + ys[0]] == null) continue;
        let originColour = board[x + xs[0]][y + ys[0]].topColour; // if all are the same as top right
        for (let n = 0; n < 4; n++) {
          // for each corner of square mask
          if (
            board[x + xs[n]][y + ys[n]] === null ||
            board[x + xs[n]][y + ys[n]].topColour != originColour
          ) {
            allSame = false;
            break;
          }
        }
        if (allSame) {
          if (originColour === colourWin) {
            return 300;
          } else {
            return -300;
          }
        }
      }
    }
  } catch (e) {
    console.log(e, board);
  }

  let totalWinnerSquares = 0;
  let totalLoserSquares = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (board[i][j] === null) continue;
      if (board[i][j].topColour === colourWin) {
        totalWinnerSquares++;
      } else {
        totalLoserSquares++;
      }
    }
  }
  // if (totalWinnerSquares === 0) {
  //   return +Infinity;
  // }

  //   let makingWinningSquares = 0;
  // let makingLosingSquares = 0;

  // let totalWinningSquaresChecked = 0;
  // let totalLosingSquaresChecked = 0;

  for (let x = -1; x < 4; x++) {
    for (let y = -1; y < 4; y++) {
      let winnersInThisSquare = 0;
      let losersInThisSquare = 0;
      let hasWinnerColour = false;
      // let hasLoserColour = false;
      for (let n = 0; n < 4; n++) {
        // for each corner of square mask
        // console.log(x + xs[n], y + ys[n]);
        if (
          typeof board[x + xs[n]] === "undefined" ||
          typeof board[x + xs[n]][y + ys[n]] === "undefined"
        ) {
          // console.log("is undefined");
          // winnersInThisSquare--;
          // losersInThisSquare--;
          // hasWinnerColour = false;
          // hasLoserColour = false;
          // console.log("is undefined", x + xs[n], y + ys[n]);
          winnersInThisSquare -= 1;
          // break;
          continue;
        }
        if (board[x + xs[n]][y + ys[n]] === null) {
          // winnersInThisSquare += 0.5;
          // losersInThisSquare += 0.5;
          // winnersInThisSquare ;
          continue;
        }

        if (board[x + xs[n]][y + ys[n]].topColour === colourWin) {
          // console.log("is colour");
          hasWinnerColour = true;
          // winnersInThisSquare++;
          winnersInThisSquare += 1;
          // losersInThisSquare--;
        } else {
          // hasLoserColour = true;
          // console.log("is not colour");
          losersInThisSquare++;
          winnersInThisSquare -= 1;
          // winnersInThisSquare--;
        }
      }
      if (hasWinnerColour) {
        // makingWinningSquares += winnersInThisSquare;

        if (winnersInThisSquare == 1) makingWinningSquares += 4;
        else if (winnersInThisSquare == 2) makingWinningSquares += 8;
        else if (winnersInThisSquare == 3) makingWinningSquares += 16;
        else makingWinningSquares += winnersInThisSquare;
        if (losersInThisSquare == 3) {
          makingWinningSquares -= 60;
        }
        // makingWinningSquares += winnersInThisSquare;
      }
      //   // console.log("winnersInThisSquare", winnersInThisSquare);
      //   // makingWinningSquares += (winnersInThisSquare - 1) / 3;
      //   totalWinningSquaresChecked++;
      //   if (winnersInThisSquare == 3) {
      //     makingWinningSquares += 2;
      //   } else {
      //     makingLosingSquares += 1;
      //   }
      //   // makingWinningSquares += winnersInThisSquare / 4;
      // }
      // if (hasLoserColour) {
      //   // console.log("losersInThisSquare", losersInThisSquare);
      //   // makingLosingSquares += (losersInThisSquare - 1) / 3;
      //   totalLosingSquaresChecked++;
      //   if (losersInThisSquare == 3) {
      //     makingWinningSquares -= 2;
      //   } else {
      //     makingWinningSquares -= 1;
      //   }
      //   // makingLosingSquares += losersInThisSquare / 4;
      // }
    }
  }

  // console.log(makingWinningSquares / 6, makingLosingSquares / 6);
  // console.log(totalWinningSquaresChecked, totalLosingSquaresChecked);
  // console.log(totalWinnerSquares, totalLoserSquares);
  // console.log("fraction of total squares attempted", totalWinningSquaresChecked / 25, totalLosingSquaresChecked / 25);
  // console.log(makingWinningSquares / totalWinningSquaresChecked, makingLosingSquares / totalLosingSquaresChecked);
  // console.log(makingWinningSquares / totalWinnerSquares, makingLosingSquares / totalLoserSquares);
  // return makingSquares / 9;
  // return (totalWinningSquaresChecked / 25 - totalLosingSquaresChecked / 25 + makingWinningSquares / 6 - makingLosingSquares / 6) / 2;
  // (totalWinningSquaresChecked / 25 +
  return makingWinningSquares + 2 * totalWinnerSquares;
  // return makingSquares / totalSquares / 12;
}

function checkRequestError(socket, data, usersList, gamesList) {
  if (typeof socket.userID === "undefined") return "not logged in";
  let gameID = data.gameID;
  if (typeof gameID === "undefined") return "This game does not exist";
  let thisUser = usersList[socket.userID];
  if (typeof thisUser === "undefined") return "not logged in";
  let thisGame = gamesList[gameID];
  if (typeof thisGame === "undefined") return "This game does not exist";
  if (data.loc.i === "undefined") return "Invalid move";
  if (data.loc.j === "undefined") return "Invalid move";
  if (data.loc.i2 === "undefined") return "Invalid move";
  if (data.loc.j2 === "undefined") return "Invalid move";
  return false;
}

function chooseNextPlayer(players, userID) {
  if (!userID) {
    // Creating a new game so randomly choose the players
    if (Math.random() < 0.5) {
      return {
        userID: players[0].userID,
        userName: players[0].userName,
        type: players[1].type,
      };
    } else {
      return {
        userID: players[1].userID,
        userName: players[1].userName,
        type: players[0].type,
      };
    }
  }
  let currentPlayerIndex = _.findIndex(players, { userID });
  if (currentPlayerIndex === 0) {
    return {
      userID: players[1].userID,
      userName: players[1].userName,
      type: players[1].type,
    };
  } else {
    return {
      userID: players[0].userID,
      userName: players[0].userName,
      type: players[0].type,
    };
  }
}

function getUserNameList(usersList) {
  let userNameList = [];
  for (const user of Object.values(usersList)) {
    if (user.userName === undefined || user.type === "AI") continue;
    if (userNameList.some((elem) => elem.id === user.userID)) continue;
    userNameList.push({
      userName: user.userName,
      id: user.userID,
    });
  }

  return userNameList;
}

function createNewGameState(user1, user2) {
  let orangeColour = "#ec8e45";
  let greenColour = "#50a186";

  let user1Top, user1Bottom, user2Top, user2Bottom;
  if (Math.random() < 0.5) {
    user1Top = orangeColour;
    user1Bottom = greenColour;
    user2Top = greenColour;
    user2Bottom = orangeColour;
  } else {
    user1Top = greenColour;
    user1Bottom = orangeColour;
    user2Top = orangeColour;
    user2Bottom = greenColour;
  }
  let user1Shelf = createPieces(user1Top, user1Bottom, user1);
  let user2Shelf = createPieces(user2Top, user2Bottom, user2);
  let state = {
    board: [
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ],
    [user1]: user1Shelf,
    [user2]: user2Shelf,
  };

  return { state, user1Top, user2Top };
}

function resetJustFlipped(state) {
  for (let i = 0; i < state.board.length; i++) {
    for (let j = 0; j < state.board[i].length; j++) {
      if (state.board[i][j] === null) continue;
      state.board[i][j].justFlipped = false;
    }
  }

  return state;
}

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

const guid = () =>
  (
    S4() +
    S4() +
    "-" +
    S4() +
    "-4" +
    S4().substr(0, 3) +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  ).toLowerCase();

module.exports = {
  Piece,
  guid,
  calculateColourScores,
  resetJustFlipped,
  createNewGameState,
  escape,
  createPieces,
  isGameOver,
  checkRequestError,
  chooseNextPlayer,
  getUserNameList,
};
