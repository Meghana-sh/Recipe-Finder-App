import React, { useState } from 'react'
import './auth.css'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    setError('')
    if (mode === 'signup' && form.name.trim().length < 2) return 'Please enter your name'
    if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(form.email)) return 'Please enter a valid email'
    if (form.password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const submit = (e) => {
    e.preventDefault()
    const v = validate()
    if (v) return setError(v)
    // Simulate success
    const msg = mode === 'login' ? 'Welcome back!' : 'Account created successfully!'
    setSuccess(msg)
    // notify parent that auth succeeded (simulate)
    if (onAuth) {
      // small delay so user sees the success message briefly
      setTimeout(() => onAuth({ name: form.name, email: form.email }), 600)
    }
  }

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setSuccess('')
    setForm({ name: '', email: '', password: '' })
  }

  return (
    <div className="auth-root">
      <div className="auth-card shadow-lg">
        <div className="auth-visual">
          <div className="auth-brand">
            <div className="logo">RF</div>
            <h3>Recipe Finder</h3>
            <p className="lead">Discover recipes from what you have at home.</p>
          </div>
        </div>

        <div className="auth-form">
          <div className="mode-toggle">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Login</button>
            <button className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>Sign Up</button>
          </div>

          <form onSubmit={submit} className="form-stack">
            {mode === 'signup' && (
              <div className="form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={onChange} className="form-control" placeholder="Your full name" />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input name="email" value={form.email} onChange={onChange} className="form-control" placeholder="you@email.com" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-row">
                <input name="password" value={form.password} onChange={onChange} className="form-control" type={showPassword ? 'text' : 'password'} placeholder="Create a secure password" />
                <button type="button" className="btn btn-sm btn-outline-secondary pwd-toggle" onClick={() => setShowPassword(s => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            {error && <div className="alert alert-danger small">{error}</div>}
            {success && <div className="alert alert-success small">{success}</div>}

            <button className="btn btn-primary btn-block" type="submit">{mode === 'login' ? 'Log In' : 'Create Account'}</button>

            <div className="divider">or</div>

            <div className="socials">
              <button type="button" className="btn btn-outline-danger btn-block">Continue with Google</button>
              <button type="button" className="btn btn-outline-dark btn-block mt-2">Continue with GitHub</button>
            </div>

            <p className="small mt-3 text-muted">By continuing you agree to our Terms and Privacy Policy.</p>
          </form>
        </div>
      </div>
    </div>
  )
}
