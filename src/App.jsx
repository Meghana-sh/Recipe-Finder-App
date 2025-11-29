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
    <div>
      <div className="d-flex justify-content-end align-items-center p-3 gap-2">
        <ThemeToggle />
        <div className="me-3">Signed in as <strong>{user.email || user.name}</strong></div>
        <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Log out</button>
      </div>
      <RecipeApp />
    </div>
  )
}
