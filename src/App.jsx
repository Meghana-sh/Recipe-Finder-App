import React, { useState } from 'react'
import AuthPage from './components/Auth/AuthPage'
import ThemeToggle from './components/ThemeToggle'
import RecipeApp from './RecipeApp'

export default function App() {
  const [user, setUser] = useState(null)

  const handleAuth = (userData) => {
    setUser(userData || { name: 'User' })
  }

  const logout = () => setUser(null)

  if (!user) {
    return <AuthPage onAuth={handleAuth} />
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="app-brand">
              <div className="brand-logo">🍳</div>
              <div className="brand-text">
                <h1>Recipe Finder</h1>
                <p>Discover delicious recipes instantly</p>
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="user-section">
              <div className="user-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
              <div className="header-controls">
                <ThemeToggle />
                <button className="btn btn-logout" onClick={logout} title="Sign out">↗</button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <RecipeApp />
    </div>
  )
}
