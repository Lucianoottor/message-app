const { Op, literal } = require('sequelize');

class ConversationService {
    /**
     * @param {object} db 
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * 
     * 
     * @param {number} userId 
     * @returns {Array<object>}
     */
    async findByUserId(userId) {
        try {
            const conversations = await this.db.Conversation.findAll({
                include: [
                  
                    {
                        model: this.db.Participant,
                        as: 'ConversationParticipants',
                        where: { user_id: userId },
                        attributes: [] 
                    },
           
                    {
                        model: this.db.User,
                        as: 'participants',
                        attributes: ['id', 'email'],
                        through: { attributes: [] }
                    },
                
                    {
                        model: this.db.Message,
                        as: 'messages',
                        limit: 1,
                        order: [['createdAt', 'DESC']]
                    }
                ],
                order: [['updatedAt', 'DESC']]
            });

            if (!conversations) {
                return [];
            }
            
 
            const formattedConversations = conversations.map(convo => {
                const convoJSON = convo.toJSON();
                convoJSON.participants = convoJSON.participants.filter(p => p.id !== userId);
                return convoJSON;
            });

            return formattedConversations;

        } catch (error) {
            console.error("Error finding user conversations:", error);
            throw error;
        }
    }

    async findMessages(conversationId, userId) {
        try {
            const participant = await this.db.Participant.findOne({
                where: { user_id: userId, conversation_id: conversationId }
            });

            if (!participant) {
                const error = new Error("Acesso negado. Você não faz parte desta conversa.");
                error.statusCode = 403;
                throw error;
            }

            return await this.db.Message.findAll({
                where: { conversation_id: conversationId },
                include: [{ model: this.db.User, as: 'sender', attributes: ['id', 'email'] }],
                order: [['createdAt', 'ASC']]
            });
        } catch (error) {
            console.error("Error finding messages:", error);
            throw error;
        }
    }


    async create(initiatorId, participantIds, title = null) { // Agora aceita um título
        if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
            const error = new Error("É necessário fornecer os IDs dos participantes.");
            error.statusCode = 400;
            throw error;
        }

        const allParticipantIds = [...new Set([initiatorId, ...participantIds])].sort((a, b) => a - b);
        
      
        if (allParticipantIds.length > 2 && !title) {
            const error = new Error("Conversas em grupo precisam de um título.");
            error.statusCode = 400;
            throw error;
        }

        console.log('A tentar criar/encontrar conversa com os IDs:', allParticipantIds);

        const candidateConvoIdsQuery = await this.db.Conversation.findAll({
            attributes: ['id'], 
            include: [{
                model: this.db.Participant,
                as: 'ConversationParticipants',
                attributes: [] 
            }],
            group: ['Conversation.id'],
            having: literal(`COUNT(Conversation.id) = ${allParticipantIds.length}`)
        });
        
    
        const candidateConvoIds = candidateConvoIdsQuery.map(c => c.id);

     
        if (candidateConvoIds.length > 0) {
            
            const conversations = await this.db.Conversation.findAll({
                where: {
                    id: { [Op.in]: candidateConvoIds }
                },
                include: [{
                    model: this.db.Participant,
                    as: 'ConversationParticipants',
                    attributes: ['user_id'] 
                }]
            });

           
            for (const convo of conversations) {
                const currentParticipantIds = convo.ConversationParticipants.map(p => p.user_id).sort((a, b) => a - b);

                if (JSON.stringify(currentParticipantIds) === JSON.stringify(allParticipantIds)) {
                    console.log('Conversa existente encontrada:', convo.id);
                    return await this.db.Conversation.findByPk(convo.id, {
                         include: [{
                            model: this.db.User,
                            as: 'participants',
                            attributes: ['id', 'email'],
                            through: { attributes: [] }
                        }]
                    });
                }
            }
        }
        


        console.log('Nenhuma conversa existente encontrada. A criar nova.');
    const t = await this.db.sequelize.transaction();
    let finalConversation; // Declare here to be accessible outside the try block

    try {
        const newConversation = await this.db.Conversation.create({ title }, { transaction: t });
        
        const participants = allParticipantIds.map(id => ({
            user_id: id,
            conversation_id: newConversation.id
        }));
        await this.db.Participant.bulkCreate(participants, { transaction: t });

        // Commit the transaction
        await t.commit();

        // Fetch the complete data AFTER the transaction is successful
        finalConversation = await this.db.Conversation.findByPk(newConversation.id, {
            include: [{
                model: this.db.User,
                as: 'participants',
                attributes: ['id', 'email'],
                through: { attributes: [] }
            }]
        });
        console.log('Nova conversa criada com sucesso:', finalConversation.id);

    } catch (error) {
        // This will now only catch errors from the database operations
        await t.rollback();
        console.error("Error creating conversation:", error);
        throw new Error("Não foi possível criar a conversa devido a um erro no servidor.");
    }


    return finalConversation;
}
    /**
     * 
     * @param {number} conversationId
     * @param {string} title 
     * @param {number} userId 
     * @returns {Promise<object>} 
     */
    async updateTitle(conversationId, title, userId) {
        const participant = await this.db.Participant.findOne({
            where: { user_id: userId, conversation_id: conversationId }
        });

        if (!participant) {
            const error = new Error("Acesso negado. Você não tem permissão para alterar esta conversa.");
            error.statusCode = 403;
            throw error;
        }

        const [affectedRows] = await this.db.Conversation.update(
            { title: title },
            { where: { id: conversationId } }
        );

        if (affectedRows === 0) {
            throw new Error("Conversa não encontrada ou nenhum dado foi alterado.");
        }

        return this.db.Conversation.findByPk(conversationId, {
            include: [{
                model: this.db.User,
                as: 'participants',
                attributes: ['id', 'email'],
                through: { attributes: [] }
            }]
        });
    }

    /**
     * 
     * @param {number} conversationId 
     * @param {number} userId 
     */
    async deleteById(conversationId, userId) {
        const t = await this.db.sequelize.transaction();
        try {
            const participant = await this.db.Participant.findOne({
                where: { user_id: userId, conversation_id: conversationId },
                transaction: t
            });

            if (!participant) {
                const error = new Error("Acesso negado. Você não tem permissão para excluir esta conversa.");
                error.statusCode = 403;
                throw error;
            }

            
            await this.db.Message.destroy({ where: { conversation_id: conversationId }, transaction: t });
            await this.db.Participant.destroy({ where: { conversation_id: conversationId }, transaction: t });
            
      
            await this.db.Conversation.destroy({ where: { id: conversationId }, transaction: t });

            await t.commit();
            return;
        } catch (error) {
            await t.rollback();
            console.error("Erro ao excluir conversa:", error);
            throw error;
        }
    }

}

module.exports = ConversationService;
