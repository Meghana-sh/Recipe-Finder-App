import React, { useState } from 'react'

export default function RecipeCard({ meal, onDetails, isFavorite, onToggleFavorite, onOverride }) {
  const [showOverride, setShowOverride] = useState(false)
  const existing = meal.userOverride || {}
  const getChecked = (key) => (existing.hasOwnProperty(key) ? !!existing[key] : !!meal[key])
  return (
    <div className="card h-100">
      <div style={{ position: 'relative' }}>
        {meal.matchPercent !== undefined && (
          <div style={{ position: 'absolute', left: 8, top: 8, zIndex: 30 }}>
            <span className="badge bg-info text-dark">{meal.matchPercent}% match</span>
          </div>
        )}
        <img src={meal.strMealThumb} className="card-img-top" alt={meal.strMeal} />
        <button
          className={`fav-btn ${isFavorite ? 'fav' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(meal) }}
          title={isFavorite ? 'Remove favorite' : 'Add favorite'}
        >
          ♥
        </button>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{meal.strMeal}</h5>
        <div className="mb-2 d-flex align-items-center">
          <div style={{ flex: 1 }}>
            {meal.isVegetarian && <span className="badge bg-success me-1">Vegetarian</span>}
            {meal.isVegan && <span className="badge bg-success text-white me-1">Vegan</span>}
            {meal.isGlutenFree && <span className="badge bg-warning text-dark me-1">Gluten-free</span>}
          </div>
          <div>
            <button className="btn btn-sm btn-outline-secondary" title="Diet tags are heuristic; click to override" onClick={(e) => { e.stopPropagation(); setShowOverride(s => !s) }}>⚙️</button>
          </div>
        </div>
        {showOverride && (
          <div className="mb-2 border rounded p-2">
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" id={`ov-veg-${meal.idMeal}`} checked={getChecked('isVegetarian')} onChange={(e)=> { onOverride && onOverride(meal.idMeal, { isVegetarian: e.target.checked }); }} />
              <label className="form-check-label" htmlFor={`ov-veg-${meal.idMeal}`}>Vegetarian</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" id={`ov-vegan-${meal.idMeal}`} checked={getChecked('isVegan')} onChange={(e)=> { onOverride && onOverride(meal.idMeal, { isVegan: e.target.checked }); }} />
              <label className="form-check-label" htmlFor={`ov-vegan-${meal.idMeal}`}>Vegan</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" id={`ov-gf-${meal.idMeal}`} checked={getChecked('isGlutenFree')} onChange={(e)=> { onOverride && onOverride(meal.idMeal, { isGlutenFree: e.target.checked }); }} />
              <label className="form-check-label" htmlFor={`ov-gf-${meal.idMeal}`}>Gluten-free</label>
            </div>
            <div className="mt-2 text-muted" style={{ fontSize: '0.8em' }}>Overrides persist to favorites only when saved.</div>
          </div>
        )}
        <div className="mt-auto d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={onDetails}>
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
