const API_BASE_URL = 'http://localhost:8080';

/**
 * Função genérica para fazer chamadas fetch autenticadas.
 * @param {string} endpoint - O endpoint da API (ex: '/conversations').
 * @param {string} token - O token JWT de autenticação.
 * @param {object} options - Opções adicionais para o fetch.
 * @returns {Promise<any>} Os dados da resposta em JSON.
 */
const fetchWithAuth = async (endpoint, token, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ocorreu um erro na API');
    }
    
    if (response.status === 204) {
        return;
    }

    return response.json();
};

export const getConversations = (token) => {
    return fetchWithAuth('/conversations', token);
};

export const getMessages = (conversationId, token) => {
    return fetchWithAuth(`/conversations/${conversationId}/messages`, token);
};


export const searchUsers = (query, token) => {
    return fetchWithAuth(`/users/search?query=${encodeURIComponent(query)}`, token);
};

export const createConversation = ({ participantIds, title }, token) => {
    return fetchWithAuth('/conversations', token, {
        method: 'POST',
        body: JSON.stringify({ participantIds, title })
    });
    
};
export const registerUser = (email, password) => {
    return fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
    }).then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ocorreu um erro no registo');
        }
        return response.json();
    });
};

export const updateConversationTitle = (conversationId, title, token) => {
    return fetchWithAuth(`/conversations/${conversationId}/title`, token, {
        method: 'PUT',
        body: JSON.stringify({ title })
    });
};

export const deleteConversation = (conversationId, token) => {
    return fetchWithAuth(`/conversations/${conversationId}`, token, {
        method: 'DELETE',
    });
};

