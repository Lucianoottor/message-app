const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Message = sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        conversation_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Conversations',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('sent', 'delivered', 'read'),
            defaultValue: 'sent',
            allowNull: false
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        timestamps: true, 
    });

    Message.associate = (models) => {
        Message.belongsTo(models.Conversation, {
            foreignKey: 'conversation_id',
            as: 'conversation'
        });
        Message.belongsTo(models.User, {
            foreignKey: 'sender_id',
            as: 'sender'
        });
    };

    return Message;
};