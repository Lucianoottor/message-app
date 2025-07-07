// /src/App.js
import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage'; // Importa a nova página

function App() {
    const [token, setToken] = useState(localStorage.getItem('chat_token'));
    const [view, setView] = useState('login'); // 'login', 'register'

    const handleLoginSuccess = (newToken) => {
        localStorage.setItem('chat_token', newToken);
        setToken(newToken);
    };

    const handleLogout = () => {
        localStorage.removeItem('chat_token');
        setToken(null);
        setView('login'); // Volta para a tela de login ao deslogar
    };

    // Renderiza o Dashboard se houver token
    if (token) {
        return <DashboardPage token={token} onLogout={handleLogout} />;
    }

    // Se não houver token, renderiza Login ou Registro
    return (
        <div>
            {view === 'login' ? (
                <LoginPage
                    onLoginSuccess={handleLoginSuccess}
                    onSwitchToRegister={() => setView('register')}
                />
            ) : (
                <RegisterPage
                    onSwitchToLogin={() => setView('login')}
                />
            )}
        </div>
    );
}

export default App;