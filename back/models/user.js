// /models/user.js
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        email: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
        },
        created_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });

    User.associate = (models) => {
        // Relação existente com Credential
        User.hasOne(models.Credential, {
            foreignKey: 'user_id',
            as: 'Credential'
        });

        // --- CORREÇÃO IMPORTANTE ---
        // Adiciona a associação que faltava. Agora o User "sabe" que pode
        // ter muitas conversas através da tabela Participant.
        User.belongsToMany(models.Conversation, {
            through: models.Participant,
            foreignKey: 'user_id',
            as: 'conversations' // O alias 'conversations' corresponde ao que o controller usa
        });
    };

    return User;
};
