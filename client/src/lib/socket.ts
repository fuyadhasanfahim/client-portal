import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_API_URL!, {
    withCredentials: true,
    autoConnect: false,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});
