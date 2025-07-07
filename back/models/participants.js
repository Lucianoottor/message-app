// /models/participants.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Participant = sequelize.define('Participant', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'id'
            },
            allowNull: false
        },
        conversation_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Conversations',
                key: 'id'
            },
            allowNull: false
        }
    }, {
        timestamps: false
    });

    // --- ADICIONADO: Bloco de associações ---
    // Define que um registo de participante pertence a um utilizador e a uma conversa.
    Participant.associate = (models) => {
        Participant.belongsTo(models.User, { foreignKey: 'user_id' });
        Participant.belongsTo(models.Conversation, { foreignKey: 'conversation_id' });
    };

    return Participant;
};
