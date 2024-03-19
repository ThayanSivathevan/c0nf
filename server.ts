import express, { Application } from "express";
import { Server as SocketIOServer } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import path from "path";

export class Server {
    private httpServer: HTTPServer;
    private app: Application;
    private io: SocketIOServer;

    private activeSockets: string[] = [];

    private readonly DEFAULT_PORT = parseInt(process.env.PORT as string) || 5000;
    private users: Record<string, string> = {};
    constructor() {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = new SocketIOServer(this.httpServer, {
            allowEIO3: true,
            cors: {
                origin: "http://localhost:3000"
            }
        });

        this.configureApp();
        this.configureRoutes();
        this.handleSocketConnection();
    }

    private configureApp(): void {
        this.app.use(express.static('frontend/out'));
    }

    private configureRoutes(): void {
        this.app.get("*", (_req, res) => {
            res.send(path.resolve(__dirname, 'frontend', 'out', 'index.html'))
        })
    }

    private handleSocketConnection(): void {
        this.io.on("connection", socket => {
            const existingSocket = this.activeSockets.find(
                existingSocket => existingSocket === socket.id
            );

            if (!existingSocket) {
                this.activeSockets.push(socket.id);
                socket.emit("update-user-list", {
                    users: this.users,
                });
            }
            console.log("Socket connected: " + socket.id);
            socket.on("add-user", (data: any) => {
                this.users[socket.id] = data.username;
                socket.broadcast.emit("update-user-list", {
                    users: this.users,
                });
                console.log("User added: " + data.username);
            });

            socket.on("call-user", (data: any) => {
                console.log(this.users[socket.id] + " calling user " + this.users[data.to]);
                socket.to(data.to).emit("call-made", {
                    offer: data.offer,
                    socket: socket.id,
                    username: this.users[socket.id]
                });
            });

            socket.on("make-answer", data => {
                socket.to(data.to).emit("answer-made", {
                    socket: socket.id,
                    answer: data.answer
                });
            });

            socket.on("reject-call", data => {
                socket.to(data.from).emit("call-rejected", {
                    socket: socket.id
                });
            });

            socket.on("disconnect", () => {
                this.activeSockets = this.activeSockets.filter(
                    existingSocket => existingSocket !== socket.id
                );
                delete this.users[socket.id];
                socket.broadcast.emit("update-user-list", {
                    users: this.users,
                });
            });
        });
    }

    public listen(callback: (port: number) => void): void {
        this.httpServer.listen(this.DEFAULT_PORT, () => {
            callback(this.DEFAULT_PORT);
        });
    }
}