import app from "./app";
import http from "http";
import connectDB from "./config";

const server = http.createServer(app);

const PORT = process.env.PORT || 7777;
connectDB();
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

