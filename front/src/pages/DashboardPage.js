// /src/pages/ChatPage.js
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createSocket } from '../services/socket';
import { getConversations, getMessages, deleteConversation, updateConversationTitle } from '../services/api';
import CreateConversationModal from '../components/ConversationModal';
import ConversationList from '../components/ConversationList';
import ConversationView from '../components/ConversationView'; 

function ChatPage({ token, onLogout }) {
    // --- State Management ---
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);

    

    // ✅ FIX: Create a ref to hold the current selectedConversationId.
    // This solves the "stale closure" problem in the socket listener.
    const selectedConversationIdRef = useRef(selectedConversationId);
    useEffect(() => {
        selectedConversationIdRef.current = selectedConversationId;
    }, [selectedConversationId]);


    // Derives the active conversation object from the selected ID
    const activeConversation = useMemo(() => {
        return conversations.find(c => c.id === selectedConversationId) || null;
    }, [conversations, selectedConversationId]);

    // --- Reusable Fetch Function ---
    // 👇 Step 1: Extract the fetch logic into a reusable, memoized function.
    const fetchConversations = useCallback(async () => {
        if (!token) return;
        try {
            const fetchedConversations = await getConversations(token);
            setConversations(fetchedConversations);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    }, [token]);

    // --- Effects ---

    // Effect to connect the socket and fetch initial data
    useEffect(() => {
        if (!token) return;

        const newSocket = createSocket(token);
        setSocket(newSocket);
        fetchConversations();
        

        // --- Socket Listeners ---
        const handleChatMessage = (message) => {
            // ✅ FIX: Use the ref to get the LATEST selected conversation ID
            if (message.conversation_id === selectedConversationIdRef.current) {
                setMessages(prev => [...prev, message]);
            }
            // Update the preview in the conversation list
            setConversations(prevConvos => prevConvos.map(c =>
                c.id === message.conversation_id ? { ...c, messages: [message] } : c
            ).sort((a, b) => new Date(b.messages[0]?.createdAt || 0) - new Date(a.messages[0]?.createdAt || 0)));
        };

        const handleNewConversation = (newConversation) => {
            // This listener handles receiving a new conversation from the server
            // (e.g., when another user adds you to a chat)
            setConversations(prev => {
                const isAlreadyPresent = prev.some(c => c.id === newConversation.id);
                if (!isAlreadyPresent) {
                    return [newConversation, ...prev];
                }
                return prev;
            });
            // Optional: Automatically join the room to be safe
            newSocket.emit('join conversation', { conversation_id: newConversation.id });
        };

        newSocket.on('chat message', handleChatMessage);
        newSocket.on('new conversation', handleNewConversation);


        // ✅ FIX: Add proper cleanup to remove listeners on unmount
        return () => {
            newSocket.off('chat message', handleChatMessage);
            newSocket.off('new conversation', handleNewConversation);
            newSocket.disconnect();
        };
    }, [token]);

    // Effect to fetch messages when the active conversation changes
    useEffect(() => {
        if (!activeConversation) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const fetchedMessages = await getMessages(activeConversation.id, token);
                setMessages(fetchedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
                setMessages([]);
            } finally {
                setIsLoadingMessages(false);
            }
        };
        fetchMessages();
    }, [activeConversation, token]);

    // Effect to scroll the message view
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    // --- Event Handlers ---

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socket?.connected && activeConversation) {
            const messageData = { conversation_id: activeConversation.id, content: newMessage };
            socket.emit('chat message', messageData, (ack) => {
                // Optional: Handle acknowledgment from server if needed
                if (ack?.status !== 'ok') {
                    console.error("Message failed to send");
                }
            });
            setNewMessage('');
        }
    };
    const handleDeleteConversation = async (conversationId) => {
        try {
            await deleteConversation(conversationId, token);
            // Remove the conversation from the local state
            setConversations(prev => prev.filter(c => c.id !== conversationId));
            // De-select the conversation
            setSelectedConversationId(null);
        } catch (error) {
            console.error("Error deleting conversation:", error);
            // Optionally show an error message to the user
        }
    };

    const onSuccess = (conversationData) => {
        if (!socket?.connected) {
            console.error("Socket not connected. Cannot create conversation.");
            // Optionally show an error to the user
            return;
        }

        socket.emit('new conversation', conversationData, (response) => {
            // This callback runs after the server processes the event
            if (response?.status === 'ok') {
                console.log('Conversation created successfully', response.conversation);
                setSelectedConversationId(response.conversation.id); // Activate the new conversation
                setIsModalOpen(false);
                fetchConversations(); // Refresh the conversation list
            } else {
                console.error("Failed to create conversation:", response?.message);
                // Optionally, you could pass this error back to the modal to display it
                // For now, we'll just log it and leave the modal open.
            }
        });
    };

    // --- Render Logic ---
    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {isModalOpen && (
                <CreateConversationModal
                    token={token}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={onSuccess} 
                />
            )}

            <div className="w-1/4 bg-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <button onClick={() => setIsModalOpen(true)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg">
                        New Conversation
                    </button>
                </div>
                <ConversationList
                    conversations={conversations}
                    onSelectConversation={setSelectedConversationId}
                    selectedConversationId={selectedConversationId}
                />
                <div className="p-4 mt-auto border-t border-gray-700">
                    <button onClick={onLogout} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                        Logout
                    </button>
                </div>
            </div>

            <ConversationView
                conversation={activeConversation}
                token={token}
                socket={socket}
                onUpdateTitle={updateConversationTitle}
                onDeleteConversation={handleDeleteConversation}
            />
        </div>
    );
}

export default ChatPage;
