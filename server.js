const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const server = require("http").createServer();
const path = require("path");
const app = express();

// This will store the messages for the time of the session
const messages = [];

// Launch the Websocket server
const WebsocketServer = new WebSocket.Server({ server: server });

WebsocketServer.on("connection", function connection(ws, req) {
  ws.on("message", function incoming(data) {
    const message = JSON.parse(data);
    console.log(message);
    switch (message.type) {
      case "LOGIN":
        ws.send(JSON.stringify({ type: "MESSAGES", data: messages}));
        return;
      case "NEW_MESSAGE":
        // Add the message to the list of messages
        messages.push({ author: message.author, message: message.message, channel: message.channel });

        // Sends all messages to all connected clients
        WebsocketServer.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "MESSAGES", data: messages}));
          }
        });
        return;
    }
  });

  // Display an error when one occurs
  // The most likely candidate is when a browser closes without closing
  // the connection properly
  ws.on("error", console.warn);
});

app.use(express.static(path.join(__dirname, "../build")));

app.get("*", (request, result) => {
  result.sendFile(path.join(__dirname, "../build/index.html"));
});

server.on("request", app);
server.listen(8080, function listening() {
  console.log("Listening on ", server.address().port);
});
