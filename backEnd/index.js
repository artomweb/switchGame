import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
  path: "/switch",
});

let _ = require("lodash");
const switchHelpers = require("./helpers");
const aiHelpers = require("./ai");

let usersList = {};
let gamesList = {};
let requestList = {};

io.on("connection", (socket) => {
  try {
    console.log("new socket", socket.id);
    let newGUID = switchHelpers.guid();
    socket.userID = newGUID;
    socket.timestamp = Math.floor(new Date().getTime() / 1000);
    socket.type = "user";
    usersList[socket.userID] = socket;

    console.log(Object.keys(usersList).length);
  } catch (e) {
    console.log(e);
  }

  socket.on("username input", (data) => {
    try {
      // Sanitise user input
      let userNameInput = _.escape(data.name);
      console.log("username received: ", data.name, userNameInput);
      socket.userName = userNameInput;

      let userNameList = switchHelpers.getUserNameList(usersList);
      for (const key of Object.keys(usersList)) {
        try {
          usersList[key].emit("new user list", {
            yourID: usersList[key].userID,
            userNameList,
          });
        } catch (e) {
          console.log(e);
          // delete usersList[key];
        }
      }

      socket.emit("connected client", { msg: "Connection successful" });
    } catch (e) {
      return console.log(e);
    }
  });

  // User clicks "update list of users"
  socket.on("get username list", () => {
    try {
      let userNameList = switchHelpers.getUserNameList(usersList);
      socket.emit("new user list", { yourID: socket.userID, userNameList });
    } catch (e) {
      return console.log(e);
    }
  });

  // User clicks request button
  socket.on("request connection", (data) => {
    try {
      console.log("received request");
      if (!socket.userID)
        return socket.emit("error", { msg: "You are not logged in" });
      let requestedId = data.id;

      let requestedUser = _.find(usersList, { userID: requestedId });

      if (requestedUser) {
        requestList[socket.userID] = {
          requestedId,
          timestamp: Math.floor(new Date().getTime() / 1000),
        };
        console.log("found requested user");
        requestedUser.emit("request incoming", {
          userName: socket.userName,
          userID: socket.userID,
        });
      }
    } catch (e) {
      return console.log(e);
    }
  });

  // User clicks accept on requst notification
  socket.on("accept request", (data) => {
    try {
      let opponentID = data.id;
      console.log(
        "CREATE GAME, request from: ",
        opponentID,
        " to ",
        socket.userID
      );

      // Verify that the user that made the request exists
      if (usersList[opponentID] === undefined) {
        return console.log("the user that made the request does not exist");
      }

      // Verify that the user made the request
      if (requestList[opponentID].requestedId !== socket.userID) {
        return console.log("user did not make this request");
      }

      // The request has been accepted so remove it from the list
      delete requestList[opponentID];

      // Init a new game
      let gameID = switchHelpers.guid();
      let players = [socket, usersList[data.id]];
      let nextPlayer = switchHelpers.chooseNextPlayer(players);
      let { state, user1Top, user2Top } = switchHelpers.createNewGameState(
        socket.userID,
        usersList[opponentID].userID
      );

      socket.colour = user1Top;
      usersList[data.id].colour = user2Top;

      gamesList[gameID] = {
        players,
        nextPlayer,
        state,
        timestamp: Math.floor(new Date().getTime() / 1000),
      };

      let thisGame = gamesList[gameID];

      //Push update to all players of game
      for (let player of thisGame.players) {
        let state = [...thisGame.state.board, thisGame.state[player.userID]];
        let yourTurn = thisGame.nextPlayer.userID === player.userID;
        player.emit("game update", {
          yourTurn,
          gameID,
          yourID: player.userID,
          yourColour: player.colour,
          state,
          nextPlayer: nextPlayer.userName,
        });
      }
    } catch (e) {
      return console.log(e);
    }
  });

  socket.on("play ai", () => {
    try {
      console.log("CREATE GAME against ai ", socket.userID);
      socket.againstAI = true;

      let userID = switchHelpers.guid();
      let aiGUID = switchHelpers.guid();
      let ai = {
        type: "AI",
        userID: aiGUID,
        userName: "AI",
        timestamp: Math.floor(new Date().getTime() / 1000),
      };
      usersList[aiGUID] = ai;
      socket.userID = userID;

      // Init a new game
      let gameID = switchHelpers.guid();
      let players = [socket, ai];
      // let nextPlayer = switchHelpers.chooseNextPlayer(players);
      console.log(players[1].userName);
      let { state, user1Top, user2Top } = switchHelpers.createNewGameState(
        socket.userID,
        ai.userID
      );

      socket.colour = user1Top;
      usersList[aiGUID].colour = user2Top;
      usersList[userID] = socket;

      let nextPlayer = { userID: socket.userID };

      gamesList[gameID] = {
        players,
        nextPlayer,
        state,
        timestamp: Math.floor(new Date().getTime() / 1000),
      };

      let thisGame = gamesList[gameID];

      // // console.log("nextPlayer", nextPlayer);

      // if (nextPlayer.type === "AI") {
      //   console.log("next player is ai");
      //   thisGame.state = aiHelpers.getBestMove(thisGame.state, thisGame.players[1], thisGame.players[0]);
      // }

      // thisGame.nextPlayer = switchHelpers.chooseNextPlayer(players, nextPlayer);

      // console.log("next player", thisGame.nextPlayer.userID);

      //Push update to all players of game
      for (let player of thisGame.players) {
        if (player.type === "AI") continue;
        let yourTurn = thisGame.nextPlayer.userID === player.userID;
        let state = [...thisGame.state.board, thisGame.state[player.userID]];
        player.emit("game update", {
          yourTurn,
          gameID,
          yourID: player.userID,
          yourColour: player.colour,
          state,
          nextPlayer: nextPlayer.userName,
        });
      }
    } catch (e) {
      return console.log(e);
    }
  });

  socket.on("move", (data) => {
    try {
      let error = switchHelpers.checkRequestError(
        socket,
        data,
        usersList,
        gamesList
      );
      if (error) {
        return socket.emit("error", { msg: error });
      }

      const gameID = data.gameID;
      let thisGame = gamesList[gameID];

      if (thisGame.nextPlayer.userID !== socket.userID) {
        console.log("not your go", thisGame.nextPlayer, socket.userID);
        return;
      }

      thisGame.state = switchHelpers.resetJustFlipped(thisGame.state);
      if (!(data.loc.i === data.loc.i2 && data.loc.j === data.loc.j2)) {
        let x = data.loc.j2 * (800 / 4) + 800 / 4 / 2;
        let y = data.loc.i2 * (800 / 4) + 800 / 4 / 2;
        let oldPiece;
        if (data.loc.i === 4) {
          oldPiece = thisGame.state[socket.userID][data.loc.j];
          thisGame.state[socket.userID][data.loc.j] = null;
        } else {
          oldPiece = thisGame.state.board[data.loc.i][data.loc.j];
          thisGame.state.board[data.loc.i][data.loc.j] = null;
        }
        let newPiece = new switchHelpers.Piece(
          x,
          y,
          oldPiece.topColour,
          oldPiece.bottomColour,
          oldPiece.justFlipped,
          oldPiece.hasFlipped
        );
        thisGame.state.board[data.loc.i2][data.loc.j2] = newPiece;
      } else {
        let thisPiece = thisGame.state.board[data.loc.i][data.loc.j];
        let tempColour = thisPiece.topColour;
        thisPiece.topColour = thisPiece.bottomColour;
        thisPiece.bottomColour = tempColour;
        thisPiece.justFlipped = true;
        thisPiece.hasFlipped = true;
      }

      let gameOver = switchHelpers.isGameOver(thisGame.state.board);
      if (gameOver != false) {
        let winner = _.find(thisGame.players, { colour: gameOver });
        // console.log("game over", winner);
        for (let player of thisGame.players) {
          if (player.type === "AI") continue;
          if (player.userID === winner.userID) {
            player.emit("game over", {
              msg: "YOU ARE THE WINNER",
              yourTurn: false,
              gameID,
              yourID: player.userID,
              yourColour: player.colour,
              state: thisGame.state.board,
              nextPlayer: "",
            });
          } else {
            player.emit("game over", {
              msg: "The winner is: " + winner.userName,
              yourTurn: false,
              gameID,
              yourID: player.userID,
              yourColour: player.colour,
              state: thisGame.state.board,
              nextPlayer: "",
            });
          }
        }
        delete gamesList[gameID];
        return;
      }

      let nextPlayer = switchHelpers.chooseNextPlayer(
        thisGame.players,
        socket.userID
      );

      //Push update to all players of game
      for (let player of thisGame.players) {
        if (player.type === "AI") continue;
        let yourTurn = nextPlayer.userID === player.userID;
        let state = [...thisGame.state.board, thisGame.state[player.userID]];
        player.emit("game update", {
          yourTurn,
          gameID,
          yourID: player.userID,
          yourColour: player.colour,
          state,
          nextPlayer: nextPlayer.userName,
        });
      }

      if (nextPlayer.type === "AI") {
        // console.log("state before ai", thisGame.state);
        let { state, lastMove } = aiHelpers.getBestMove(
          thisGame.state,
          thisGame.players[1],
          thisGame.players[0]
        );
        thisGame.players[1].lastMove = lastMove;
        thisGame.state = state;
        // console.log("state after ai", thisGame.state.board);

        nextPlayer = { userID: socket.userID, type: socket.type };
      }
      // console.log("colour scores", switchHelpers.calculateColourScores(thisGame.state.board, thisGame.players[0].colour));

      thisGame.nextPlayer = nextPlayer;

      // console.log("this state", thisGame.state);

      gameOver = switchHelpers.isGameOver(thisGame.state.board);
      if (gameOver != false) {
        let winner = _.find(thisGame.players, { colour: gameOver });
        // console.log("game over", winner);
        for (let player of thisGame.players) {
          if (player.type === "AI") continue;
          if (player.userID === winner.userID) {
            player.emit("game over", {
              msg: "YOU ARE THE WINNER",
              yourTurn: false,
              gameID,
              yourID: player.userID,
              yourColour: player.colour,
              state: thisGame.state.board,
              nextPlayer: "",
            });
          } else {
            player.emit("game over", {
              msg: "The winner is: " + winner.userName,
              yourTurn: false,
              gameID,
              yourID: player.userID,
              yourColour: player.colour,
              state: thisGame.state.board,
              nextPlayer: "",
            });
          }
        }
        delete gamesList[gameID];
        return;
      }

      // console.log("next player", nextPlayer);

      //Push update to all players of game
      for (let player of thisGame.players) {
        if (player.type === "AI") continue;
        let yourTurn = nextPlayer.userID === player.userID;
        let state = [...thisGame.state.board, thisGame.state[player.userID]];
        player.emit("game update", {
          yourTurn,
          gameID,
          yourID: player.userID,
          yourColour: player.colour,
          state,
          nextPlayer: nextPlayer.userName,
        });
      }
    } catch (e) {
      return console.log(e);
    }
  });

  socket.on("disconnect", () => {
    try {
      console.log(usersList);
      console.log("Disconnecting: ", socket.userID);
      delete usersList[socket.userID];
      console.log(usersList);
    } catch (e) {
      console.log("error disconnecting", e, socket.userID);
    }
  });
});

setTimeout(() => {
  try {
    let timeNow = new Date().getTime();
    for (const key of Object.keys(requestList)) {
      if (requestList[key].timestamp + 30 * 60 * 1000 < timeNow) {
        console.log("Deleting expired request, ", requestList[key]);
        delete requestList[key];
      }
    }
    for (const key of Object.keys(gamesList)) {
      if (gamesList[key].timestamp + 60 * 60 * 1000 < timeNow) {
        console.log("Deleting expired game, ", gamesList[key]);
        delete gamesList[key];
      }
    }
    // 1 hour
    for (const key of Object.keys(usersList)) {
      if (usersList[key].timestamp + 60 * 60 * 1000 < timeNow) {
        console.log("Deleting expired user, ", usersList[key]);
        delete usersList[key];
      }
    }
  } catch (e) {
    return console.log(e);
  }
}, 30 * 60 * 1000);

httpServer.listen(2037);
