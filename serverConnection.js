var socket = io("https://rppi.artomweb.com/filler");
let myID;

socket.on("new user list", function (msg) {
  updateUsersOnline(msg);
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
});

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
