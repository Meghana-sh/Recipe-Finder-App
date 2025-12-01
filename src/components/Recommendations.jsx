import React, { useState, useEffect } from 'react'
import { getRecommendations, getPersonalizedMessage } from '../helpers/recommendationsHelper'

export default function Recommendations({ onSearchSelect }) {
  const [recommendations, setRecommendations] = useState(null)
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const recs = getRecommendations()
    if (recs) {
      setRecommendations(recs)
      setMessage(getPersonalizedMessage())
    }
  }, [])

  if (!recommendations) {
    return null
  }

  return (
    <div className="card mb-3" style={{ backgroundColor: '#f0f7ff', borderColor: '#0d6efd' }}>
      <div
        className="card-body p-3"
        style={{ cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">💡 Personalized for You</h6>
          <small className="text-muted">{isExpanded ? '▼' : '▶'}</small>
        </div>
        <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.9em' }}>{message}</p>
      </div>

      {isExpanded && (
        <div className="card-footer" style={{ backgroundColor: '#ffffff' }}>
          {recommendations.topSearches && recommendations.topSearches.length > 0 && (
            <div className="mb-3">
              <h6 className="small">Your Top Searches</h6>
              <div className="d-flex flex-wrap gap-1">
                {recommendations.topSearches.map((search, idx) => (
                  <button
                    key={idx}
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onSearchSelect(search)}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recommendations.topCategories && recommendations.topCategories.length > 0 && (
            <div className="mb-3">
              <h6 className="small">Your Favorite Categories</h6>
              <div className="d-flex flex-wrap gap-1">
                {recommendations.topCategories.map((cat, idx) => (
                  <button
                    key={idx}
                    className="btn btn-sm btn-outline-info"
                    onClick={() => onSearchSelect(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recommendations.topAreas && recommendations.topAreas.length > 0 && (
            <div className="mb-3">
              <h6 className="small">Cuisines You Love</h6>
              <div className="d-flex flex-wrap gap-1">
                {recommendations.topAreas.map((area, idx) => (
                  <button
                    key={idx}
                    className="btn btn-sm btn-outline-success"
                    onClick={() => onSearchSelect(area)}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recommendations.preferredDiets && recommendations.preferredDiets.length > 0 && (
            <div>
              <h6 className="small">Your Dietary Preferences</h6>
              <div className="d-flex flex-wrap gap-1">
                {recommendations.preferredDiets.map((diet, idx) => {
                  const labels = {
                    vegetarian: '🥬 Vegetarian',
                    vegan: '🌱 Vegan',
                    glutenFree: '🌾 Gluten-Free'
                  }
                  return (
                    <span key={idx} className="badge bg-light text-dark">
                      {labels[diet] || diet}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <small className="text-muted d-block mt-3">
            Searches: {recommendations.searchCount} | Favorites: {recommendations.favoritesCount}
          </small>
        </div>
      )}
    </div>
  )
}
