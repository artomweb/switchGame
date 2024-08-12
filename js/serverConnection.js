var socket = io("https://api.artomweb.com/switch");
let gameID;

let requestAlert;
let gameJoinedMessage;

let serverData;

let allServerData;

document
  .getElementById("usernameInput")
  .addEventListener("keyup", function (event) {
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
        listHTML.push(
          "<div> - " +
            thisUsername +
            "   <button onclick='requestConnection({id:\"" +
            user.id +
            '", userName:"' +
            thisUsername +
            "\"})'>Request</button></div>"
        );
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
  requestAlert = new bootstrap.Alert(
    createMessage(
      "REQUEST INCOMING",
      "From " + data.userName,
      "alert-primary",
      20000,
      "acceptRequest('" + data.userID + "')"
    )
  );
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

  console.log(data.state);

  createGamePieces(data.state);

  let gameStatus = document.getElementById("gameStatus");

  if (data.yourTurn) {
    gameStatus.innerHTML = "It's YOUR turn";
  } else {
    gameStatus.innerHTML = "IT's " + data.nextPlayer + "'s TURN";
  }
});

function leaveGame() {
  console.log("LEAVE GAME");
  gameJoinedMessage.close();
}

function serverMove(loc) {
  console.log("move", loc);
  socket.emit("move", { gameID, loc });
}

socket.on("error", (data) => {
  createMessage("ERROR", data.msg, "alert-danger");
});

socket.on("connect", function () {
  let gameStatus = document.getElementById("gameStatus");
  gameStatus.innerHTML = "Connected";
});

socket.on("disconnect", function () {
  let gameStatus = document.getElementById("gameStatus");
  gameStatus.innerHTML = "No server connection";
});

socket.on("game over", (data) => {
  console.log("GAME OVER", data);
  allServerData = data;

  createGamePieces(data.state);

  let gameStatus = document.getElementById("gameStatus");
  gameStatus.innerHTML = data.msg;
  createMessage("GAME OVER", data.msg, "alert-info", 15000);
});

function playAi() {
  let sketch = document.getElementById("sketch");
  sketch.style["touch-action"] = "none";
  console.log("play ai");
  socket.emit("play ai");
}
