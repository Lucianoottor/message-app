// /src/pages/RegisterPage.js
import React, { useState } from 'react';
import { registerUser } from '../services/api';

function RegisterPage({ onSwitchToLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('As passwords não coincidem.');
            return;
        }

        setLoading(true);
        try {
            await registerUser(email, password);
            setSuccess('Registo efetuado com sucesso! Pode agora fazer login.');
            // Limpa o formulário após sucesso
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">Criar Conta</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                        <input
                            id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
                        <input
                            id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2" htmlFor="confirm-password">Confirmar Password</label>
                        <input
                            id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    {success && <p className="text-green-500 text-center mb-4">{success}</p>}

                    <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-500">
                        {loading ? 'A registar...' : 'Registar'}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <button onClick={onSwitchToLogin} className="text-cyan-400 hover:underline">
                        Já tem uma conta? Faça login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;