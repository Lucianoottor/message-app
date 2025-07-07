// /models/conversation.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Conversation = sequelize.define('Conversation', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: true,
    });

    Conversation.associate = (models) => {
        Conversation.hasMany(models.Message, {
            foreignKey: 'conversation_id',
            as: 'messages'
        });

        // --- CORREÇÃO: Adicionado um alias explícito à associação ---
        // Isto ajuda o Sequelize a construir queries complexas sem ambiguidade.
        Conversation.hasMany(models.Participant, {
            foreignKey: 'conversation_id',
            as: 'ConversationParticipants' // Um alias único e descritivo
        });

        Conversation.belongsToMany(models.User, {
            through: models.Participant,
            foreignKey: 'conversation_id',
            as: 'participants'
        });
    };

    return Conversation;
};
