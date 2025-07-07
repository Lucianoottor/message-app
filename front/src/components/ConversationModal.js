// /src/components/CreateConversationModal.js
import React, { useState, useRef } from 'react';
import { searchUsers } from '../services/api'; // API call for creating conversation is removed

/**
 * A modal component for creating a new conversation.
 * It allows searching for users, selecting them, and optionally adding a title for group chats.
 *
 * @param {object} props
 * @param {string} props.token - The authentication token for API calls.
 * @param {Function} props.onClose - Function to call when the modal should be closed.
 * @param {Function} props.onSuccess - Callback function that receives the new conversation data.
 */
function CreateConversationModal({ token, onClose, onSuccess }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    
    // A ref to the title input field for focusing on error
    const titleInputRef = useRef(null);

    /**
     * Handles changes in the user search input field.
     */
    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            try {
                const results = await searchUsers(query, token);
                // Filter out users that are already selected
                setSearchResults(results.filter(user => !selectedUsers.some(su => su.id === user.id)));
            } catch (error) {
                console.error("Error searching users:", error);
            }
        } else {
            setSearchResults([]);
        }
    };

    /**
     * Adds a user from the search results to the selected list.
     * @param {object} user - The user object to select.
     */
    const handleSelectUser = (user) => {
        setSelectedUsers(prev => [...prev, user]);
        setSearchResults(prev => prev.filter(u => u.id !== user.id));
        setSearchQuery(''); // Clear search input after selection
    };

    /**
     * Removes a user from the selected list.
     * @param {number} userId - The ID of the user to remove.
     */
    const handleRemoveUser = (userId) => {
        setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    };

    /**
     * Handles the final creation of the conversation.
     * It validates the input and passes the data to the parent component.
     */
    const handleCreate = () => {
        // Validate that at least one user is selected
        if (selectedUsers.length === 0) {
            setError('Please select at least one user.');
            return;
        }

        // Validate that a title is provided for group chats
        if (selectedUsers.length > 1 && !title.trim()) {
            setError('Please provide a title for the group chat.');
            titleInputRef.current?.focus();
            return;
        }

        setError(''); // Clear any previous errors

        // Prepare the data payload for the parent component (ChatPage)
        const conversationData = {
            participantIds: selectedUsers.map(u => u.id),
            title: selectedUsers.length > 1 ? title.trim() : null
        };
        onSuccess(conversationData);
    };

    const isGroupChat = selectedUsers.length > 1;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">New Conversation</h2>
                
                <div className="mb-4 p-2 bg-gray-900 rounded-md min-h-[40px]">
                    <p className="text-gray-400 mb-2">To:</p>
                    <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(user => (
                            <div key={user.id} className="bg-cyan-600 text-white px-2 py-1 rounded-full flex items-center">
                                <span>{user.email}</span>
                                <button onClick={() => handleRemoveUser(user.id)} className="ml-2 text-white font-bold">×</button>
                            </div>
                        ))}
                    </div>
                </div>

                {isGroupChat && (
                    <div className="mb-4">
                        <input
                            ref={titleInputRef} 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Group Name..."
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                )}

                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search users by email..."
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                <ul className="mt-2 max-h-40 overflow-y-auto">
                    {searchResults.map(user => (
                        <li key={user.id} onClick={() => handleSelectUser(user)} className="p-2 hover:bg-gray-700 cursor-pointer rounded">
                            {user.email}
                        </li>
                    ))}
                </ul>

                {error && <p className="text-red-500 text-center mt-4">{error}</p>}

                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg">Cancel</button>
                    <button onClick={handleCreate} disabled={selectedUsers.length === 0} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateConversationModal;
