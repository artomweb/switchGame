var socket = io("http://localhost:3000/filler");
let myID;
let gameID;

let requestAlert;
let gameJoinedMessage;

let myTurn = false;

let serverBoard = [[], [], [], []];

socket.on("new user list", function (msg) {
  updateUsersOnline(msg);
});

socket.on("connected client", (data) => {
  console.log(data.msg);
  if (data.error === undefined) {
    createMessage("Connection Status", "Connection Successful", "", "alert-success");
    // createMessage("Connection Status", "Connection Successful", "alert-primary", (timed = false));
  }
});

function updateUsersOnline(msg) {
  console.log(msg);

  let users = msg.userNameList;
  let listDiv = document.getElementById("listOfUsers");

  myID = msg.yourID;

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
        listHTML.push("<div> - " + thisUsername + "   <button onclick='requestConnection(\"" + user.id + "\")'>Request</button></div>");
      } else {
        listHTML.push("<div> - " + thisUsername + "   </div>");
      }
    }
  }
  listDiv.innerHTML = listHTML.join("");
}

function requestConnection(id) {
  console.log("REQUEST SEND TO ", id);
  socket.emit("request connection", { id });
}

socket.on("request incoming", (data) => {
  console.log("Incoming request from: ", data.userName);
  requestAlert = new bootstrap.Alert(createMessage("REQUEST INCOMING", "From " + data.userName, "acceptRequest('" + data.userID + "')", "alert-primary", 10000));
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

socket.on("joined game", (data) => {
  console.log("Sucessfully joined game with", data.userName, data);

  gameID = data.gameID;
  gameJoinedMessage = new bootstrap.Alert(nonDismissible("Currently Playing Game", "with " + data.userName, "alert-info", "LEAVE", "leaveGame()"));

  createPieces(data.top, data.bottom);
});

socket.on("game update", (data) => {
  console.log(data);

  let gameStatus = document.getElementById("gameStatus");

  if (data.nextPlayer.userID == data.yourID) {
    gameStatus.innerHTML = "IT's YOUR TURN";
    myTurn = true;
  } else {
    gameStatus.innerHTML = "IT's " + data.nextPlayer.userName + "'S TURN";
    myTurn = false;
  }

  serverBoard = data.state;
});

function leaveGame() {
  console.log("LEAVE GAME");
  gameJoinedMessage.close();
}

function serverFlipPiece(piece) {
  console.log("FLIPPED", piece);
  socket.emit("flip piece", { gameID, piece });
}

function serverAddPiece(piece) {
  console.log("ADDED", piece);
  socket.emit("add to board", { gameID, piece });
}

socket.on("error", (data) => {
  createMessage("ERROR", data.msg, "alert-danger");
});
