const bcrypt = require('bcryptjs');
const { Op } = require('sequelize'); 
const auth = require('../http/authMiddleware'); 


class UserService {
    /**
     * @param {object} db 
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * 
     * @param {string} email 
     * @param {string} password 
     * @returns {object|null} 
     */
    async create(email, password) {
       
        const t = await this.db.sequelize.transaction();
        try {
            const newUser = await this.db.User.create({ email: email }, { transaction: t });
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await this.db.Credential.create({
                user_id: newUser.id,
                password_hash: hashedPassword
            }, { transaction: t });
            await t.commit();
            return newUser ? newUser.toJSON() : null;
        } catch (error) {
            await t.rollback();
            console.error("Error creating user:", error);
            throw error;
        }
    }

    /**
     * 
     * @returns {Array<object>|null} 
     */
    async findAll() {
        try {
            const allUsers = await this.db.User.findAll();
            return allUsers ? allUsers : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * 
     * @param {number} id 
     * @returns {object|null} 
     */
    async findById(id) {
        try {
            const user = await this.db.User.findByPk(id);
            return user ? user : null;
        } catch (error) {
            throw error;
        }
    }
    
    /**
     *
     * 
     * @param {string} query 
     * @param {number} currentUserId 
     * @returns {Array<object>} 
     */
    async search(query, currentUserId) {
    try {
        const users = await this.db.User.findAll({
            where: {
               
                email: { [Op.like]: `%${query}%` }, 
                id: { [Op.ne]: currentUserId }
            },
            limit: 10,
            attributes: ['id', 'email']
        });
        return users;
    } catch (error) {
        console.error("Error searching for users:", error);
        throw error;
    }
}
    /**
     *  
     * @param {string} email 
     * @param {string} password 
     * @returns {object|null} 
     * 
     */
    async login(email, password) {
        try {
            const user = await this.db.User.findOne({
                where: { email: email },
                include: {
                    model: this.db.Credential,
                    as: 'Credential'
                }
            });

            if (!user || !user.Credential) {
                return null;
            }

            const isPasswordValid = await bcrypt.compare(password, user.Credential.password_hash);

            if (isPasswordValid) {
                const token = await auth.generateToken(user);
                const userJson = user.toJSON();
                delete userJson.Credential;
                userJson.Token = token;
                return userJson;
            } else {
                return null;
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserService;
