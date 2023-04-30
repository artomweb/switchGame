var socket = io("http://localhost:3000/filler");
let gameID;

let requestAlert;
let gameJoinedMessage;

let serverData;

let allServerData;

document.getElementById("usernameInput").addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.code === "Enter") {
    document.getElementById("submitButton").click();
  }
});

socket.on("new user list", function (msg) {
  updateUsersOnline(msg);
});

socket.on("connected client", (data) => {
  console.log(data.msg);
  let sketch = document.getElementById("sketch");
  sketch.style["touch-action"] = "none";
  if (data.error === undefined) {
    createMessage("Connection Successful", "", "alert-success");
    // createMessage("Connection Status", "Connection Successful", "alert-primary", (timed = false));
  }
});

function updateUsersOnline(msg) {
  console.log(msg);

  let users = msg.userNameList;
  let listDiv = document.getElementById("listOfUsers");

  let myID = msg.yourID;

  if (users.length === 0) {
    listDiv.innerHTML = "no users online";
    return;
  }

  let listHTML = [];

  for (let user of users) {
    let thisUsername = user.userName;
    if (user.id == myID) {
      listHTML.push("<div> - " + thisUsername + " (YOU)</div>");
    } else {
      if (myID) {
        listHTML.push("<div> - " + thisUsername + "   <button onclick='requestConnection({id:\"" + user.id + '", userName:"' + thisUsername + "\"})'>Request</button></div>");
      } else {
        listHTML.push("<div> - " + thisUsername + "   </div>");
      }
    }
  }
  listDiv.innerHTML = listHTML.join("");
}

function requestConnection(user) {
  console.log("REQUEST SEND TO ", user);
  createMessage("Request Sent to ", user.userName, "alert-info");
  socket.emit("request connection", { id: user.id });
}

socket.on("request incoming", (data) => {
  console.log("Incoming request from: ", data.userName);
  requestAlert = new bootstrap.Alert(createMessage("REQUEST INCOMING", "From " + data.userName, "alert-primary", 10000, "acceptRequest('" + data.userID + "')"));
});

function acceptRequest(id) {
  requestAlert.close();
  socket.emit("accept request", { id });
}

function submitUsername() {
  let usernameField = document.getElementById("usernameInput");
  console.log(usernameField.value);
  if (usernameField.value) {
    socket.emit("username input", { name: usernameField.value });
  }
}

function updateUsersList() {
  socket.emit("get username list");
}

socket.on("game update", (data) => {
  console.log(data);

  allServerData = data;

  gameID = data.gameID;

  console.log(data.state[data.yourID]);

  createShelfPieces(data.state[data.yourID]);

  createGamePieces(data.state.board);

  let gameStatus = document.getElementById("gameStatus");

  if (data.nextPlayer.userID == data.yourID) {
    gameStatus.innerHTML = "IT's YOUR TURN";
  } else {
    gameStatus.innerHTML = "IT's " + data.nextPlayer.userName + "'s TURN";
  }
});

function leaveGame() {
  console.log("LEAVE GAME");
  gameJoinedMessage.close();
}

function serverFlipPiece(i, j) {
  console.log("FLIPPED", i, j);
  socket.emit("flip piece", { gameID, i, j });
}

function serverMovedOntoBoard(idx, i, j) {
  console.log("ADDED", idx);
  socket.emit("add to board", { gameID, idx, i, j, userID: allServerData.yourID });
}

function serverMovedAroundBoard(i1, j1, i2, j2) {
  console.log(i1, j1, i2, j2);
  socket.emit("moved piece around", { gameID, userID: allServerData.yourID, i1, j1, i2, j2 });
}

socket.on("error", (data) => {
  createMessage("ERROR", data.msg, "alert-danger");
});

socket.on("game over", (data) => {
  console.log("GAME OVER", data);
  allServerData = data;

  createShelfPieces(data.state[data.yourID]);
  createGamePieces(data.state.board);

  let gameStatus = document.getElementById("gameStatus");
  gameStatus.innerHTML = data.msg;
  createMessage("GAME OVER", data.msg, "alert-info", 15000);
});
