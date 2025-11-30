import React, { useState, useEffect, useRef } from 'react'
import Fuse from 'fuse.js'

const RECENT_KEY = 'rf_recent_searches'

const COMMON_INGREDIENTS = [
  'chicken','beef','pork','fish','egg','rice','tomato','onion','garlic','butter','milk','flour','sugar','cheese','potato','carrot','mushroom','pepper','salt','olive oil','lemon'
]

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('')
  const [recent, setRecent] = useState([])
  const [open, setOpen] = useState(false)
  const [suggests, setSuggests] = useState([])
  const ref = useRef()

  const fuse = useRef(new Fuse(COMMON_INGREDIENTS.map(i=>({i})), { keys: ['i'], threshold: 0.4 }))

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

  useEffect(() => {
    if (!value) { setSuggests([]); return }
    const r = fuse.current.search(value).slice(0,6).map(x=>x.item.i)
    setSuggests(r)
  }, [value])

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

  const choose = (r) => {
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

      {open && (
        <div className="list-group position-absolute w-100 shadow-sm mt-1 z-50" style={{ maxHeight: 220, overflow: 'auto' }}>
          {value && suggests.map((s, idx) => (
            <button key={idx} className="list-group-item list-group-item-action" onClick={() => choose(s)}>{s}</button>
          ))}

          {!value && recent && recent.length > 0 && recent.map((r, idx) => (
            <button key={idx} className="list-group-item list-group-item-action" onClick={() => choose(r)}>{r}</button>
          ))}
        </div>
      )}
    </div>
  )
}
