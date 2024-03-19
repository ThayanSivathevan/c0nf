import { Server } from "./server";
 
const server = new Server();
 
server.listen((port) => {
    console.log(`Server running at http://localhost:${port}/`);
});
