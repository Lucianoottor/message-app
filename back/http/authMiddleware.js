const jwt = require('jsonwebtoken');
const secret = '123';

async function generateToken(user){
    const id = user.id;
    const email = user.email;
    const token = jwt.sign({id,email},secret, {expiresIn:'1h'});
    return token;
}

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Token não informado.' });
    }

    const token = authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ message: 'Token mal formatado.' });
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido.' });
            
        }
        console.log('Payload do Token:', decoded);
        req.user = decoded;
        next();
    });
};

module.exports = {authMiddleware, generateToken};
