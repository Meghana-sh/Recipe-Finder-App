import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('rf_theme') === 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('rf_theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button className={`btn btn-sm ${dark ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setDark(d => !d)}>{dark ? 'Dark' : 'Light'}</button>
  )
}
