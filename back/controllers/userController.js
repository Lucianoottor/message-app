// /controllers/userController.js
const db = require('../models'); // Importa o objeto db do Sequelize
const UserService = require('../services/userService'); // Importa a sua classe de serviço
const userService = new UserService(db); // Cria uma instância do seu serviço

// O Op é usado apenas no serviço agora, mas pode ser removido daqui se não for usado em mais nenhum lugar.
const { Op } = require('sequelize'); 

const userController = {
    /**
     * Cria um novo utilizador.
     * Chama o método `create` do userService.
     */
    createUser: async (req, res) => {
        const { email, password } = req.body;
        try {
            const newUser = await userService.create(email, password);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar utilizador.", error: error.message });
        }
    },

    /**
     * Autentica um utilizador.
     * Chama o método `login` do userService.
     */
    loginUser: async (req, res) => {
        const { email, password } = req.body;
        try {
            const userWithToken = await userService.login(email, password);
            if (!userWithToken) {
                return res.status(401).json({ message: "Email ou password inválidos." });
            }
            res.status(200).json({
                message: "Login successful",
                data: userWithToken
            });
        } catch (error) {
            res.status(500).json({ message: "Erro durante o login.", error: error.message });
        }
    },

    /**
     * Obtém todos os utilizadores.
     * Chama o método `findAll` do userService.
     */
    getAllUsers: async (req, res) => {
        try {
            const users = await userService.findAll();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar utilizadores.", error: error.message });
        }
    },

    /**
     * Obtém um utilizador por ID.
     * Chama o método `findById` do userService.
     */
    getUserById: async (req, res) => {
        const { id } = req.params;
        try {
            const user = await userService.findById(id);
            if (!user) {
                return res.status(404).json({ message: "Utilizador não encontrado." });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar utilizador.", error: error.message });
        }
    },

    /**
     * --- CORRIGIDO ---
     * Procura por utilizadores por email.
     * Agora chama o método `search` do userService, delegando a lógica.
     */
    searchUsers: async (req, res) => {
        const { query } = req.query;
        const currentUserId = req.user.id; // Vem do authMiddleware

        if (!query) {
            return res.status(400).json({ message: "É necessário um termo de pesquisa." });
        }

        try {
            // Delega a busca para a camada de serviço
            const users = await userService.search(query, currentUserId);
            res.status(200).json(users);
        } catch (error) {
            // O serviço já faz o log do erro, aqui apenas retornamos uma resposta genérica.
            res.status(500).json({ message: "Erro ao procurar utilizadores." });
        }
    }
};

module.exports = userController;
