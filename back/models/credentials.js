// models/credentials.js
const Sequelize = require('sequelize');
module.exports = (sequelize) =>{
    // Use a singular, capitalized name here too.
    const Credential = sequelize.define('Credential',{
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey:true
        },
        user_id:{
            type: Sequelize.INTEGER,
            allowNull:false,
            references: {
                model: 'Users', // Sequelize automatically pluralizes the table name
                key: 'id'
            }
        },
        password_hash:{
            type: Sequelize.STRING,
            allowNull:false
        }
    });

    Credential.associate = (models) => {
        // Now models.User will exist.
        // Also using a better alias here.
        Credential.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };
    return Credential;
};