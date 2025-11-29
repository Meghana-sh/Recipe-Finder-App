import React, { useState, useEffect } from 'react'
import SearchBar from './components/SearchBar'
import RecipeCard from './components/RecipeCard'
import RecipeModal from './components/RecipeModal'

export default function RecipeApp() {
  const [query, setQuery] = useState('')
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6) // pagination: show more
  const [categories, setCategories] = useState([])
  const [areas, setAreas] = useState([])
  const [filter, setFilter] = useState({ category: '', area: '' })

  const searchRecipes = async (ingredients) => {
    setQuery(ingredients)
    setLoading(true)
    setError('')
    setRecipes([])
    try {
      // First try ingredient search (best for comma-separated ingredients)
      const byIngredient = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredients)}`)
      const ingData = await byIngredient.json()
      if (ingData.meals && ingData.meals.length) {
        setRecipes(ingData.meals)
      } else {
        // Fallback: try searching by meal name (users often type dish names)
        const byName = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(ingredients)}`)
        const nameData = await byName.json()
        if (nameData.meals && nameData.meals.length) {
          // search.php returns full meal objects; map to the same minimal shape if necessary
          setRecipes(nameData.meals.map(m => ({ idMeal: m.idMeal, strMeal: m.strMeal, strMealThumb: m.strMealThumb })))
        } else {
          setRecipes([])
          setError('No recipes found — try common ingredients like "chicken" or "rice", or a dish name (e.g. "arrabiata").')
        }
      }
    } catch (err) {
      setError('Error fetching recipes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // load favorites from localStorage
    try {
      const raw = localStorage.getItem('rf_favorites')
      if (raw) setFavorites(JSON.parse(raw))
    } catch (e) {}
    // default auto-search on mount
    searchRecipes('chicken')
    // load categories and areas for filtering
    ;(async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list'),
          fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list')
        ])
        const cJson = await cRes.json()
        const aJson = await aRes.json()
        if (cJson.meals) setCategories(cJson.meals.map(m => m.strCategory))
        if (aJson.meals) setAreas(aJson.meals.map(m => m.strArea))
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  const saveFavorites = (next) => {
    setFavorites(next)
    try { localStorage.setItem('rf_favorites', JSON.stringify(next)) } catch (e) {}
  }

  const toggleFavorite = (meal) => {
    const exists = favorites.find(f => f.idMeal === meal.idMeal)
    let next
    if (exists) next = favorites.filter(f => f.idMeal !== meal.idMeal)
    else next = [{ idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb }, ...favorites]
    saveFavorites(next)
  }

  const displayed = showFavorites ? favorites : recipes.slice(0, visibleCount)

  const showDetails = async (id) => {
    setLoading(true)
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
      const data = await res.json()
      if (data.meals && data.meals[0]) {
        setSelected(data.meals[0])
      } else {
        setError('Recipe details not found')
      }
    } catch (err) {
      setError('Error fetching recipe details')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => setSelected(null)

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center">
        <h1 className="mb-4">Recipe Finder</h1>
        <div>
          <button className={`btn btn-sm ${showFavorites ? 'btn-primary' : 'btn-outline-primary'} me-2`} onClick={() => setShowFavorites(s => !s)}>
            {showFavorites ? 'Viewing Favorites' : 'View Favorites'} ({favorites.length})
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => { setVisibleCount(6); searchRecipes('chicken') }}>Reset</button>
        </div>
      </div>

      <div className="d-flex gap-2 mb-3 align-items-center">
        <div style={{ flex: 1 }}>
          <SearchBar onSearch={(q) => { setFilter({ category: '', area: '' }); setVisibleCount(6); searchRecipes(q) }} />
        </div>

        <select className="form-select form-select-sm" style={{ width: 180 }} value={filter.category} onChange={(e) => { setFilter(f => ({ ...f, category: e.target.value })); if (e.target.value) searchRecipes(e.target.value) }}>
          <option value="">All Categories</option>
          {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>

        <select className="form-select form-select-sm" style={{ width: 160 }} value={filter.area} onChange={(e) => { setFilter(f => ({ ...f, area: e.target.value })); if (e.target.value) searchRecipes(e.target.value) }}>
          <option value="">All Areas</option>
          {areas.map((a, i) => <option key={i} value={a}>{a}</option>)}
        </select>
      </div>

      {loading && <div className="mt-3">Loading...</div>}
      {error && <div className="alert alert-warning mt-3">{error}</div>}

      <div className="row mt-4">
        {displayed.map((r) => (
          <div className="col-md-4 mb-4" key={r.idMeal}>
            <RecipeCard meal={r} onDetails={() => showDetails(r.idMeal)} isFavorite={!!favorites.find(f=>f.idMeal===r.idMeal)} onToggleFavorite={toggleFavorite} />
          </div>
        ))}
      </div>

      {!showFavorites && recipes.length > visibleCount && (
        <div className="text-center mb-4">
          <button className="btn btn-outline-primary" onClick={() => setVisibleCount(c => c + 6)}>Load more</button>
        </div>
      )}

      {showFavorites && favorites.length === 0 && (
        <div className="alert alert-info">No favorites yet — click the ♥ on a recipe to save it.</div>
      )}

      {selected && <RecipeModal meal={selected} onClose={closeModal} />}
    </div>
  )
}
