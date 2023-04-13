// import { Server } from "socket.io";

// const io = new Server();

// io.on("connection", (client) => {
//   client.on("event", (data) => {
//     // クライアントから受信したデータを処理する
//     console.log(data);
//   });
//   client.on("disconnect", () => {
//     // クライアントが切断したときの処理
//   });
// });

// const port = 3001;
// io.listen(port);
// console.log(`Listening on port ${port}`);

const WebSocket = require("ws");
const ws = new WebSocket.Server({ port: 8080 });

ws.on("connection", (socket) => {
  console.log("connected!");

  socket.on("message", (ms) => {
    console.log(ms);
  });

  socket.on("close", () => {
    console.log("good bye.");
  });
});
