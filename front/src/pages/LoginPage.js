// /src/pages/LoginPage.js
import React, { useState } from 'react';

function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Falha ao fazer login');
            }
            
            // --- CORREÇÃO IMPORTANTE ---
            // O token está em data.data.Token, conforme a resposta da sua API
            const token = data.data.Token;

            if (!token) {
                throw new Error('Token não foi encontrado na resposta do servidor.');
            }

            // Chama a função para guardar o token e avançar para a próxima página
            onLoginSuccess(token);
            
        } catch (err) {
            console.error('Erro durante o login:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-white">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
                        <input
                            id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
                        <input
                            id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-500">
                        {loading ? 'A entrar...' : 'Entrar'}
                    </button>
                </form>
                <div className="text-center mt-6">
                    <button onClick={onSwitchToRegister} className="text-cyan-400 hover:underline">
                        Não tem uma conta? Registre-se
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
