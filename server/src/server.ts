import { connect } from "mongoose";
import app from "./app.js";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import registerSocketHandlers from "./socket.js";
import envConfig from "./config/env.config.js";

const { database_url, port, frontend_url } = envConfig;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let io: any;

async function Server() {
    try {
        await connect(database_url as string);

        const server = createServer(app);

        io = new SocketIOServer(server, {
            cors: {
                origin: frontend_url,
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ["websocket", "polling"],
            connectionStateRecovery: {
                maxDisconnectionDuration: 2 * 60 * 1000,
                skipMiddlewares: true,
            },
        });

        app.set("io", io);

        registerSocketHandlers(io);

        server.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
        });
    } catch (error) {
        console.error("❌ Error connecting to database:", error);
        process.exit(1);
    }
}

Server();
