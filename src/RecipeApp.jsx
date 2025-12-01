import React, { useState, useEffect } from 'react'
// Spelling / normalization map for common dish name variants
const SPELLING_MAP = {
  biriyani: 'biryani',
  biryani: 'biryani',
  briyani: 'biryani',
  "chiken": 'chicken',
  "chiken curry": 'chicken curry'
}
import SearchBar from './components/SearchBar'
import Pantry from './components/Pantry'
import RecipeCard from './components/RecipeCard'
import RecipeModal from './components/RecipeModal'
import ImageRecognition from './components/ImageRecognition'
import Recommendations from './components/Recommendations'
import { trackUserAction } from './helpers/recommendationsHelper'

export default function RecipeApp() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState(null)
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
  const [pantry, setPantry] = useState([])
  const [dietFilters, setDietFilters] = useState({ vegetarian: false, vegan: false, glutenFree: false })
  const [rawRecipes, setRawRecipes] = useState([])
  const [showImageRecognition, setShowImageRecognition] = useState(false)

  // --- Ingredient normalization & tagging helpers ---
  const normalizeIngredient = (s) => {
    if (!s) return ''
    let t = String(s).toLowerCase()
    // remove parenthetical content
    t = t.replace(/\(.*?\)/g, ' ')
    // remove fractions and numbers
    t = t.replace(/\d+\/\d+|\d+/g, ' ')
    // remove common measurement units
    t = t.replace(/\b(tbsps?|tbsp|tsp|teaspoons?|tablespoons?|cups?|kg|g|grams?|oz|ounce|ounces|ml|l|pinch|clove|cloves|slice|slices|strip|strips|can|cans|package|packages|stick|sticks)\b/g, ' ')
    // remove punctuation
    t = t.replace(/[^a-z\s]/g, ' ')
    // collapse spaces
    t = t.replace(/\s+/g, ' ').trim()
    // naive singularize common plurals
    if (t.endsWith('ies')) t = t.replace(/ies$/, 'y')
    else if (t.endsWith('ses')) t = t.replace(/ses$/, 's')
    else if (t.endsWith('s')) t = t.slice(0, -1)
    return t
  }

  const tokensFromIngredient = (s) => {
    const n = normalizeIngredient(s)
    if (!n) return []
    return n.split(' ').filter(w => w.length > 1)
  }

  const tagFromIngredients = (ingredientsList) => {
    const all = (ingredientsList || []).map(i => normalizeIngredient(i)).join(' ')

    // expanded curated mapping for ambiguous or aliased ingredients
    const mapping = {
      'veg stock': 'vegetable stock',
      'vegetable stock': 'vegetable stock',
      'fish sauce': 'fish',
      'soy sauce': 'soy sauce',
      'light soy': 'soy sauce',
      'dark soy': 'soy sauce',
      'prawns': 'shrimp',
      'shrimp paste': 'shrimp',
      'scallions': 'spring onion',
      'spring onions': 'spring onion',
      'green onion': 'spring onion',
      'chilies': 'chili',
      'chilli': 'chili',
      'chili flakes': 'chili',
      'bell pepper': 'pepper',
      'capsicum': 'pepper',
      'cilantro': 'coriander',
      'coriander leaves': 'coriander',
      'cornflour': 'cornstarch',
      'corn starch': 'cornstarch',
      'cornstarch': 'cornstarch',
      'mayonnaise': 'egg',
      'anchovy paste': 'anchovy',
      'worcestershire sauce': 'anchovy',
      'bicarbonate of soda': 'baking soda',
      'baking powder': 'baking powder',
      'breadcrumbs': 'breadcrumbs',
      'bread crumbs': 'breadcrumbs',
      'plain flour': 'flour',
      'all purpose flour': 'flour',
      'self raising flour': 'flour'
    }

    let norm = all
    // apply mapping replacements first
    Object.keys(mapping).forEach(k => {
      norm = norm.replace(new RegExp(`\\b${k}\\b`, 'g'), mapping[k])
    })

    // expanded stopwords that commonly appear in ingredient descriptions
    const stopwords = [
      'fresh', 'dried', 'minced', 'chopped', 'large', 'small', 'ground', 'to', 'taste', 'optional', 'slice', 'slices',
      'finely', 'roughly', 'peeled', 'seeded', 'grated', 'zest', 'juice', 'packed', 'softened', 'room', 'temperature',
      'beaten', 'divided', 'halved', 'trimmed', 'rinsed', 'drained', 'drained and patted dry', 'for serving', 'garnish',
      'about', 'approximately', 'cup', 'cups', 'tbsp', 'tsp', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons'
    ]
    stopwords.forEach(w => { norm = norm.replace(new RegExp(`\\b${w}\\b`, 'g'), ' ') })
    norm = norm.replace(/\s+/g, ' ').trim()

    // blacklist / signals for meat, dairy, gluten
    const meatRe = /\b(chicken|beef|pork|lamb|bacon|ham|anchovy|anchovies|fish|salmon|tuna|shrimp|prawn|crab|lobster|turkey|duck|sausage|veal|prosciutto|pepperoni|salami|mackerel|sardine|octopus|squid)\b/
    const dairyRe = /\b(egg|eggs|milk|cheese|butter|cream|yogurt|ghee|paneer|custard|yoghurt|honey)\b/
    const glutenRe = /\b(flour|wheat|breadcrumbs|pasta|noodle|noodles|cracker|soy sauce|barley|rye|semolina|couscous|bulgur)\b/

    const hasMeat = meatRe.test(norm)
    const hasDairy = dairyRe.test(norm)
    const hasGluten = glutenRe.test(norm)

    const isVegetarian = !hasMeat
    const isVegan = !hasMeat && !hasDairy
    const isGlutenFree = !hasGluten

    return { isVegetarian, isVegan, isGlutenFree }
  }

  // helper: effective tag considering user overrides
  const effectiveTag = (r, tag) => {
    if (!r) return false
    if (r.userOverride && r.userOverride.hasOwnProperty(tag)) return r.userOverride[tag]
    return r[tag]
  }

  // helper: enrich an array of favorite items with tags/details
  const enrichFavoritesWithTags = async (favArray) => {
    const need = favArray.filter(f => f && f.idMeal)
    if (!need.length) return favArray
    const details = await Promise.all(need.map(async (f) => {
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${f.idMeal}`)
        const d = await res.json()
        return d.meals ? d.meals[0] : null
      } catch (e) { return null }
    }))

    const updated = [...favArray]
    need.forEach((fav, idx) => {
      const full = details[idx]
      if (!full) return
      let ingredientsList = []
      for (let i = 1; i <= 20; i++) {
        const ing = full[`strIngredient${i}`]
        const measure = full[`strMeasure${i}`]
        if (ing && ing.trim()) ingredientsList.push(`${measure ? measure : ''} ${ing}`.trim())
      }
      const tags = tagFromIngredients(ingredientsList)
      const pos = updated.findIndex(u => u.idMeal === fav.idMeal)
      if (pos >= 0) {
        updated[pos] = { ...updated[pos], ingredientsList, ...tags }
      }
    })
    return updated
  }

  // handle user overrides for a recipe's dietary tags
  const handleOverride = (mealId, override) => {
    // update rawRecipes
    if (rawRecipes && rawRecipes.length) {
      const nextRaw = rawRecipes.map(r => r.idMeal === mealId ? ({ ...r, userOverride: { ...(r.userOverride||{}), ...override } }) : r)
      setRawRecipes(nextRaw)
      setRecipes(nextRaw)
    } else if (recipes && recipes.length) {
      const next = recipes.map(r => r.idMeal === mealId ? ({ ...r, userOverride: { ...(r.userOverride||{}), ...override } }) : r)
      setRecipes(next)
    }

    // update favorites if present
    if (favorites && favorites.length) {
      const nextFavs = favorites.map(f => f.idMeal === mealId ? ({ ...f, userOverride: { ...(f.userOverride||{}), ...override } }) : f)
      setFavorites(nextFavs)
      try { localStorage.setItem('rf_favorites', JSON.stringify(nextFavs)) } catch (e) {}
    }
  }

  // Handle detected ingredients from image recognition
  const handleImageIngredientsDetected = (ingredients) => {
    // Search for recipes using the detected ingredients
    searchRecipes(ingredients.join(','))
  }

  const searchRecipes = async (ingredients) => {
    setQuery(ingredients)
    try {
      trackUserAction('search', ingredients)
    } catch (e) {}
    setLoading(true)
    setError('')
    setRecipes([])
    try {
      let ingData = null
      let nameData = null
      
      // First try ingredient search (best for comma-separated ingredients)
      const byIngredient = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredients)}`)
      ingData = await byIngredient.json()
      
      if (ingData.meals && ingData.meals.length) {
        setRecipes(ingData.meals)
      } else {
        // Fallback: try searching by meal name (users often type dish names)
        const byName = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(ingredients)}`)
        nameData = await byName.json()
        if (nameData.meals && nameData.meals.length) {
          // search.php returns full meal objects; map to the same minimal shape if necessary
          setRecipes(nameData.meals.map(m => ({ idMeal: m.idMeal, strMeal: m.strMeal, strMealThumb: m.strMealThumb })))
          setSuggestions(null)
        } else {
          // No exact matches — provide helpful suggestions (spelling alternates, ingredient searches)
          setRecipes([])
          const msg = 'No recipes found — try common ingredients like "chicken" or "rice", or a dish name (e.g. "arrabiata").'
          setError(msg)

          // Build suggestions
          try {
            const qNorm = (ingredients || '').toLowerCase().trim()
            const alternates = []
            if (qNorm && SPELLING_MAP[qNorm] && SPELLING_MAP[qNorm] !== qNorm) alternates.push(SPELLING_MAP[qNorm])

            // Simple heuristics for ingredient suggestions
            const ingredientSugs = []
            if (/biri|bry|biriy/i.test(qNorm)) {
              ingredientSugs.push('rice', 'chicken')
            } else {
              const first = qNorm.split(/\s+/)[0]
              if (first && first.length > 2) ingredientSugs.push(first)
              ingredientSugs.push('rice', 'chicken')
            }

            setSuggestions({ alternates: alternates.slice(0,3), ingredients: Array.from(new Set(ingredientSugs)).slice(0,4) })
          } catch (e) {
            setSuggestions(null)
          }

          setLoading(false)
          return
        }
      }
      // build the base list (either from ingredient search or name search)
      const list = (ingData && ingData.meals && ingData.meals.length) ? ingData.meals : (nameData && nameData.meals ? nameData.meals.map(m => ({ idMeal: m.idMeal, strMeal: m.strMeal, strMealThumb: m.strMealThumb })) : [])

      // fetch details for the list to compute ingredient lists and dietary tags
      if (list.length) {
        const limited = list.slice(0, 40)
        const details = await Promise.all(limited.map(async (r) => {
          try {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${r.idMeal}`)
            const d = await res.json()
            return d.meals ? d.meals[0] : null
          } catch (e) { return null }
        }))

        const enriched = limited.map((r, idx) => {
          const full = details[idx]
          let ingredientsList = []
          if (full) {
            for (let i = 1; i <= 20; i++) {
              const ing = full[`strIngredient${i}`]
              const measure = full[`strMeasure${i}`]
              if (ing && ing.trim()) ingredientsList.push(`${measure ? measure : ''} ${ing}`.trim())
            }
          }
          // compute dietary tags using normalization + heuristics
          const tags = tagFromIngredients(ingredientsList)
          return { ...r, ingredientsList, ...tags }
        })

        // If pantry present compute matchPercent and sort by it
        if (pantry && pantry.length) {
          const pantryNorm = pantry.map(p => p.trim().toLowerCase())
          const withMatch = enriched.map((r) => {
            const total = (r.ingredientsList && r.ingredientsList.length) || 1
            const matches = r.ingredientsList.reduce((acc, it) => {
              const name = it.toLowerCase()
              const found = pantryNorm.some(p => name.includes(p))
              return acc + (found ? 1 : 0)
            }, 0)
            const percent = Math.round((matches / total) * 100)
            return { ...r, matchPercent: percent }
          })
          withMatch.sort((a,b) => (b.matchPercent || 0) - (a.matchPercent || 0))
          setRawRecipes(withMatch)
          setRecipes(withMatch)
          setLoading(false)
          return
        }

        // otherwise set enriched results without matchPercent
        setRawRecipes(enriched)
        setRecipes(enriched)
        setLoading(false)
        return
      }
      // end if list.length

      // If no list found, fallback handled above
      
      
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
      if (raw) {
        const parsed = JSON.parse(raw)
        // enrich favorites with tags on load
        enrichFavoritesWithTags(parsed).then(updated => {
          setFavorites(updated)
          try { localStorage.setItem('rf_favorites', JSON.stringify(updated)) } catch (e) {}
        }).catch(() => setFavorites(parsed))
      }
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

  // When dietary filters become active and favorites exist, enrich favorites with tags so filters apply
  useEffect(() => {
    const activeDiet = dietFilters.vegetarian || dietFilters.vegan || dietFilters.glutenFree
    if (!activeDiet || !favorites || favorites.length === 0) return

    let cancelled = false
    ;(async () => {
      const needEnrich = favorites.filter(f => f.isVegetarian === undefined && f.idMeal)
      if (!needEnrich.length) return
      const details = await Promise.all(needEnrich.map(async (f) => {
        try {
          const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${f.idMeal}`)
          const d = await res.json()
          return d.meals ? d.meals[0] : null
        } catch (e) { return null }
      }))

      const updated = [...favorites]
      needEnrich.forEach((fav, idx) => {
        const full = details[idx]
        if (!full) return
        let ingredientsList = []
        for (let i = 1; i <= 20; i++) {
          const ing = full[`strIngredient${i}`]
          const measure = full[`strMeasure${i}`]
          if (ing && ing.trim()) ingredientsList.push(`${measure ? measure : ''} ${ing}`.trim())
        }
        const tags = tagFromIngredients(ingredientsList)
        const pos = updated.findIndex(u => u.idMeal === fav.idMeal)
        if (pos >= 0) {
          updated[pos] = { ...updated[pos], ingredientsList, ...tags }
        }
      })

      if (!cancelled) {
        setFavorites(updated)
        try { localStorage.setItem('rf_favorites', JSON.stringify(updated)) } catch (e) {}
      }
    })()
    return () => { cancelled = true }
  }, [dietFilters, favorites])

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
    try {
      trackUserAction('favorite')
    } catch (e) {}
  }

  // Apply dietary filters client-side. Use enriched `rawRecipes` when available.
  const source = showFavorites ? favorites : (rawRecipes && rawRecipes.length ? rawRecipes : recipes)
  const activeDiet = dietFilters.vegetarian || dietFilters.vegan || dietFilters.glutenFree
  const filtered = activeDiet ? source.filter(r => {
    if (dietFilters.vegetarian && !effectiveTag(r, 'isVegetarian')) return false
    if (dietFilters.vegan && !effectiveTag(r, 'isVegan')) return false
    if (dietFilters.glutenFree && !effectiveTag(r, 'isGlutenFree')) return false
    return true
  }) : source
  const displayed = filtered.slice(0, visibleCount)

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

      <div className="row">
        <div className="col-md-3">
          <Pantry onChange={(items) => setPantry(items)} />
          <div className="d-grid gap-2">
            <button className="btn btn-outline-primary" onClick={() => { if (pantry.length) searchRecipes(pantry.join(',')) }}>Find recipes from pantry</button>
            <button className="btn btn-outline-success" onClick={() => setShowImageRecognition(true)} title="Detect ingredients from food image">
              📸 Detect Ingredients
            </button>
          </div>
        </div>

        <div className="col-md-9">
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

        <div className="ms-2 d-flex gap-2 align-items-center">
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="checkbox" id="diet-veg" checked={dietFilters.vegetarian} onChange={(e)=> { try { trackUserAction('dietaryFilter', 'vegetarian') } catch (err) {} setDietFilters(d=>({ ...d, vegetarian: e.target.checked })) }} />
            <label className="form-check-label" htmlFor="diet-veg">Vegetarian</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="checkbox" id="diet-vegan" checked={dietFilters.vegan} onChange={(e)=> { try { trackUserAction('dietaryFilter', 'vegan') } catch (err) {} setDietFilters(d=>({ ...d, vegan: e.target.checked })) }} />
            <label className="form-check-label" htmlFor="diet-vegan">Vegan</label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" type="checkbox" id="diet-gf" checked={dietFilters.glutenFree} onChange={(e)=> { try { trackUserAction('dietaryFilter', 'gluten-free') } catch (err) {} setDietFilters(d=>({ ...d, glutenFree: e.target.checked })) }} />
            <label className="form-check-label" htmlFor="diet-gf">Gluten-free</label>
          </div>
        </div>
      </div>
    </div>
  </div>

      {loading && <div className="mt-3">Loading...</div>}
      {error && (
        <div className="alert alert-warning mt-3">
          {error}
          {suggestions && (
            <div className="mt-3">
              {suggestions.alternates && suggestions.alternates.length > 0 && (
                <div className="mb-2">
                  <strong>Did you mean:</strong>
                  {suggestions.alternates.map((a, i) => (
                    <button key={i} className="btn btn-sm btn-outline-primary ms-2" onClick={() => { setFilter({ category: '', area: '' }); setVisibleCount(6); setSuggestions(null); searchRecipes(a) }}>{a}</button>
                  ))}
                </div>
              )}

              {suggestions.ingredients && suggestions.ingredients.length > 0 && (
                <div>
                  <small className="text-muted">Try searching by ingredient:</small>
                  <div className="mt-2">
                    {suggestions.ingredients.map((ing, i) => (
                      <button key={i} className="btn btn-sm btn-outline-secondary me-2" onClick={() => { setFilter({ category: '', area: '' }); setVisibleCount(6); setSuggestions(null); searchRecipes(ing) }}>{ing}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Recommendations onSearchSelect={(q) => { setFilter({ category: '', area: '' }); setVisibleCount(6); searchRecipes(q) }} />

      <div className="row mt-4">
        {displayed.map((r) => (
          <div className="col-md-4 mb-4" key={r.idMeal}>
            <RecipeCard meal={r} onDetails={() => showDetails(r.idMeal)} isFavorite={!!favorites.find(f=>f.idMeal===r.idMeal)} onToggleFavorite={toggleFavorite} onOverride={handleOverride} />
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

      {showImageRecognition && (
        <ImageRecognition
          onIngredientsDetected={handleImageIngredientsDetected}
          onClose={() => setShowImageRecognition(false)}
        />
      )}
    </div>
  )
}
