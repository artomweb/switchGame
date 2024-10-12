const httpServer = require("http").createServer();

const { handleSwitchSocket } = require("./switch.js");

const io = require("socket.io")(httpServer, {
  // ...
  cors: {
    origin: "*",
  },
  path: "/switch",
});

const switchSocket = io.of("/switch");

switchSocket.on("connection", (socket) => {
  handleSwitchSocket(socket);
});

httpServer.listen(2037);
