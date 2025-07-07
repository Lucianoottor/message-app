import React, { useState, useEffect, useRef } from 'react';
import { getMessages } from '../services/api';
import ConversationHeader from './ConversationHeader'; // Importar o novo componente

// A view agora recebe a conversa inteira e as funções de callback
function ConversationView({ conversation, token, socket, onUpdateTitle, onDeleteConversation }) {
    function getUserIdFromToken(token) {
    if (!token) return null;
        try {
            const payload = token.split('.')[1];
            const decodedPayload = atob(payload);
            return JSON.parse(decodedPayload).id;
        } catch (error) {
            console.error("Failed to decode token:", error);
            return null;
        }
    }
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const currentUserId = getUserIdFromToken(token);


    useEffect(() => {
        if (!conversation?.id) return;

        setLoading(true);
        getMessages(conversation.id, token)
            .then(setMessages)
            .catch(err => console.error("Erro ao buscar mensagens:", err))
            .finally(() => setLoading(false));
    }, [conversation?.id, token]);

    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = (message) => {
            if (message.conversation_id === conversation?.id) {
                setMessages(prev => [...prev, message]);
            }
        };
        socket.on('chat message', handleNewMessage);
        return () => socket.off('chat message', handleNewMessage);
    }, [socket, conversation?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socket) {
            socket.emit('chat message', {
                conversation_id: conversation.id,
                content: newMessage,
            });
            setNewMessage('');
        }
    };

    if (!conversation) {
        return <div className="flex-1 flex items-center justify-center text-gray-400">Selecione uma conversa para começar</div>;
    }

    return (
        
        <div className="w-3/4 flex flex-col bg-gray-800">
            <ConversationHeader 
                conversation={conversation}
                onUpdateTitle={onUpdateTitle}
                onDeleteConversation={onDeleteConversation}
            />
            <div className="flex-1 p-6 overflow-y-auto">
                {messages.map((msg) => {
                    const isMe = msg.sender.id === currentUserId;
                    return (
                        <div key={msg.id} className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className="flex flex-col">
                                {/* Mostra o email do remetente apenas se não for "eu" */}
                                {!isMe && <p className="text-sm font-bold text-cyan-300 mb-1">{msg.sender.email}</p>}
                                
                                <div className={`p-3 rounded-lg max-w-xl ${isMe ? 'bg-cyan-700' : 'bg-gray-700'}`}>
                                    <p className="text-white">{msg.content}</p>
                                </div>
                                
                                <p className={`text-xs text-gray-500 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escreva a sua mensagem..."
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </form>
        </div>
    );
}

export default ConversationView;