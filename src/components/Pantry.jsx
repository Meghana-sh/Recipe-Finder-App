import React, { useState, useEffect } from 'react'

export default function Pantry({ onChange }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rf_pantry') || '[]')
    } catch (e) { return [] }
  })
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem('rf_pantry', JSON.stringify(items))
    if (onChange) onChange(items)
  }, [items])

  const extractIngredientsFromMeal = (meal) => {
    const ing = []
    for (let i = 1; i <= 20; i++) {
      const name = meal[`strIngredient${i}`]
      if (name && name.trim()) ing.push(name.trim().toLowerCase())
    }
    return ing
  }

  const add = async () => {
    const raw = value.trim()
    if (!raw) return
    const v = raw.toLowerCase()
    setLoading(true)
    try {
      // detect if the entered value is a dish name by searching TheMealDB
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(raw)}`)
      const data = await res.json()
      if (data && data.meals && data.meals.length) {
        // Looks like a recipe/dish rather than a single ingredient
        const proceed = window.confirm(`${raw} looks like a recipe.\n\nWould you like to import the recipe's ingredients into your pantry?\n\nPress OK to import ingredients, or Cancel to add "${raw}" as an ingredient.`)
        if (proceed) {
          const meal = data.meals[0]
          const ings = extractIngredientsFromMeal(meal)
          const merged = [...new Set([...ings, ...items.map(i=>i.toLowerCase())])]
          setItems(merged)
          setValue('')
          setLoading(false)
          return
        }
      }
    } catch (e) {
      // ignore detection errors and fall back to adding the raw value
    }

    // default: add as a normalized ingredient (lowercase)
    if (!items.map(i=>i.toLowerCase()).includes(v)) setItems([v, ...items])
    setValue('')
    setLoading(false)
  }

  const remove = (it) => setItems(items.filter(i => i !== it))

  return (
    <div className="card p-3 mb-3">
      <h6>Pantry</h6>
      <div className="d-flex gap-2 mb-2">
        <input className="form-control" placeholder="Add ingredient (e.g., tomato)" value={value} onChange={e=>setValue(e.target.value)} onKeyDown={e=>e.key==='Enter' && add()} />
        <button className="btn btn-primary" onClick={add} disabled={loading}>{loading ? 'Working…' : 'Add'}</button>
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
