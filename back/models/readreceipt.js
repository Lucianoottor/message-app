// /chat-service/src/models/ReadReceipt.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ReadReceipt = sequelize.define('ReadReceipt', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        message_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Messages',
                key: 'id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        },
        read_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['message_id', 'user_id']
            }
        ]
    });

    ReadReceipt.associate = (models) => {
        ReadReceipt.belongsTo(models.Message, { foreignKey: 'message_id' });
        ReadReceipt.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return ReadReceipt;
};
