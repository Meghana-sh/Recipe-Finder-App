import React, { useState, useEffect, useRef } from 'react'

const RECENT_KEY = 'rf_recent_searches'

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('')
  const [recent, setRecent] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const raw = localStorage.getItem(RECENT_KEY)
    if (raw) setRecent(JSON.parse(raw))
  }, [])

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current || ref.current.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const submit = (e) => {
    e && e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    // store recent (unique, front)
    const updated = [trimmed, ...recent.filter(r => r !== trimmed)].slice(0, 8)
    setRecent(updated)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
    onSearch(trimmed)
    setOpen(false)
  }

  const chooseRecent = (r) => {
    setValue(r)
    setOpen(false)
    onSearch(r)
  }

  return (
    <div className="position-relative" ref={ref}>
      <form onSubmit={submit} className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Try ingredients (chicken, rice) or a dish name (pizza)"
          value={value}
          onChange={(e) => { setValue(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      {open && recent && recent.length > 0 && (
        <div className="list-group position-absolute w-100 shadow-sm mt-1 z-50" style={{ maxHeight: 220, overflow: 'auto' }}>
          {recent.map((r, idx) => (
            <button key={idx} className="list-group-item list-group-item-action" onClick={() => chooseRecent(r)}>{r}</button>
          ))}
        </div>
      )}
    </div>
  )
}
