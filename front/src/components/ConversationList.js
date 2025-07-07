// /src/components/ConversationList.js
import React from 'react';

function ConversationList({ conversations, onSelectConversation, selectedConversationId }) {
    // A DIV principal agora é flexível e ocupa o espaço vertical restante, com scroll automático.
    // As classes de largura, fundo e borda foram removidas.
    return (
        <div className="flex-1 p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">Conversas</h2>
            <ul>
                {conversations.map((convo) => {
                    // Lógica para obter o nome de exibição.
                    // Para conversas em grupo no futuro, você pode querer mostrar o convo.title
                    const displayName = convo.participants.length > 1
                        ? (convo.title)
                        : (convo.participants.find(p => p.id !== convo.owner_id)?.email || 'Usuário Desconhecido');

                    const isSelected = convo.id === selectedConversationId;

                    return (
                        <li
                            key={convo.id}
                            onClick={() => onSelectConversation(convo.id)}
                            className={`p-3 rounded-lg cursor-pointer mb-2 transition duration-200 ${
                                isSelected 
                                ? 'bg-cyan-600' 
                                : 'hover:bg-gray-700'
                            }`}
                        >
                            <p className="font-bold">{displayName}</p>
                            <p className="text-sm text-gray-400 truncate">
                                {convo.messages[0]?.content || 'Nenhuma mensagem ainda.'}
                            </p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default ConversationList;