import React, { useState, useEffect } from 'react'

export default function Pantry({ onChange }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rf_pantry') || '[]')
    } catch (e) { return [] }
  })
  const [value, setValue] = useState('')

  useEffect(() => {
    localStorage.setItem('rf_pantry', JSON.stringify(items))
    if (onChange) onChange(items)
  }, [items])

  const add = () => {
    const v = value.trim()
    if (!v) return
    if (!items.includes(v)) setItems([v, ...items])
    setValue('')
  }

  const remove = (it) => setItems(items.filter(i => i !== it))

  return (
    <div className="card p-3 mb-3">
      <h6>Pantry</h6>
      <div className="d-flex gap-2 mb-2">
        <input className="form-control" placeholder="Add ingredient (e.g., tomato)" value={value} onChange={e=>setValue(e.target.value)} onKeyDown={e=>e.key==='Enter' && add()} />
        <button className="btn btn-primary" onClick={add}>Add</button>
      </div>
      <div className="d-flex flex-wrap gap-2">
        {items.length === 0 && <div className="text-muted small">No pantry items yet.</div>}
        {items.map((it) => (
          <div key={it} className="badge bg-light text-dark border p-2">
            {it}
            <button className="btn btn-sm btn-link ms-2 text-danger" onClick={()=>remove(it)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
