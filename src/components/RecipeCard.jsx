import React from 'react'

export default function RecipeCard({ meal, onDetails, isFavorite, onToggleFavorite }) {
  return (
    <div className="card h-100">
      <div style={{ position: 'relative' }}>
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
        <div className="mt-auto d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={onDetails}>
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}
