var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

var indexRouter = require('./routes/index');
var userRoutes = require('./routes/userRoutes');
var conversationRoutes = require('./routes/conversationRoutes'); 


const db = require('./models'); 

var app = express();

app.use(cors()); 
app.use(express.json());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', userRoutes);
app.use('/conversations', conversationRoutes);


// Função para sincronizar o banco de dados
async function applyDataStructure() {
    try {
        await db.sequelize.sync({ alter: true });
        console.log('Banco de dados sincronizado');
    } catch (err) {
        console.error('Erro ao sincronizar o banco de dados:', err);
    }
}

// Aplicando a estrutura de dados
applyDataStructure();

// Iniciar o servidor
const PORT = process.env.PORT || 8080; // Porta configurável
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});



// --- CORRIGIDO: Middleware de tratamento de erros ---
// Agora ele responde com JSON, o que é compatível com o seu frontend.
app.use((err, req, res, next) => {
    console.error(err.stack); // Mantém o log do erro no console do servidor
    res.status(500).json({ 
        message: 'Algo deu errado no servidor!',
        error: err.message // Envia a mensagem de erro real para o frontend
    });
});


module.exports = app;