// /src/services/socket.js
import { io } from 'socket.io-client';

const URL = 'http://localhost:4000';

export const createSocket = (token) => {
    return io(URL, {
        query: { token },
    });
};
