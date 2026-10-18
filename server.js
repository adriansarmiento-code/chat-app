import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
  fs.readFile("./public/index.html", (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end("Error loading page");
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

function broadcast(message) {
  const json = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(json);
    }
  });
}

wss.on("connection", (socket, req) => {
  const username = new URL(req.url, "http://localhost").searchParams.get(
    "username",
  );

  broadcast({ type: "system", text: `${username} joined` });

  socket.on("message", (data) => {
    const { username, text } = JSON.parse(data);
    broadcast({ type: "chat", username, text });
  });

  socket.on("close", () => {
    broadcast({ type: "system", text: `${username} left` });
  });
});

server.listen(PORT, () => {
  console.log("Chat server running at http://localhost:3001");
});
