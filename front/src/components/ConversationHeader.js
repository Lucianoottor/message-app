// /src/components/ConversationHeader.js
import React, { useState } from 'react';

function ConversationHeader({ conversation, onUpdateTitle, onDeleteConversation }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleUpdateTitle = () => {
        setIsMenuOpen(false);
        const newTitle = prompt('Digite o novo título da conversa:', conversation.title);
        if (newTitle && newTitle.trim() !== '') {
            onUpdateTitle(conversation.id, newTitle);
        }
    };

    const handleDelete = () => {
        setIsMenuOpen(false);
        if (window.confirm('Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.')) {
            onDeleteConversation(conversation.id);
        }
    };

    // Gera um nome de exibição para a conversa
    const displayName = conversation.title || conversation.participants.map(p => p.email).join(', ');

    return (
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-cyan-400">{displayName}</h2>
            <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-700">
                    {/* Ícone de três pontos (pode ser substituído por um SVG) */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg z-10">
                        <ul className="py-1">
                            <li>
                                <button onClick={handleUpdateTitle} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                                    Alterar Título
                                </button>
                            </li>
                            <li>
                                <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-700">
                                    Excluir Conversa
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ConversationHeader;