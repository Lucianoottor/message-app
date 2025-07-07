const jwt = require('jsonwebtoken');

const socketAuthMiddleware = (socket, next) => {
  
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {

        return next(new Error('Authentication error: Token não informado'));
    }

    const secret = '123';
    
    if (!secret) {

        return next(new Error('Configuration error: JWT_SECRET não foi definido no servidor.'));
    }


    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          
            return next(new Error('Authentication error: Token inválido'));
        }

        socket.user = decoded; 
        next(); 
    });
};

module.exports = socketAuthMiddleware;
