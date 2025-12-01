import React, { useEffect, useState } from 'react'
import { getUserHistory, getRecommendations, clearUserHistory } from '../helpers/recommendationsHelper'

export default function Dashboard({ onSearch }) {
  const [history, setHistory] = useState(null)
  const [recs, setRecs] = useState(null)

  useEffect(() => {
    setHistory(getUserHistory())
    setRecs(getRecommendations())
  }, [])

  const handleClear = () => {
    if (!confirm('Clear personalized history and recommendations?')) return
    clearUserHistory()
    setHistory(null)
    setRecs(null)
  }

  if (!history && !recs) {
    return (
      <div className="card p-3 mb-3">
        <h6 className="mb-2">Dashboard</h6>
        <div className="text-muted">No personalization data yet — use the app to build recommendations.</div>
      </div>
    )
  }

  return (
    <div className="card p-3 mb-3 dashboard-root">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Personal Dashboard</h6>
        <div>
          <button className="btn btn-sm btn-outline-secondary me-2" onClick={handleClear}>Clear History</button>
        </div>
      </div>

      <div className="row gx-3 gy-3">
        <div className="col-sm-3">
          <div className="card p-3">
            <small className="text-muted">Searches</small>
            <div className="h4 mt-1">{history?.searches?.length || 0}</div>
          </div>
        </div>
        <div className="col-sm-3">
          <div className="card p-3">
            <small className="text-muted">Favorites</small>
            <div className="h4 mt-1">{recs?.favoritesCount || 0}</div>
          </div>
        </div>
        <div className="col-sm-3">
          <div className="card p-3">
            <small className="text-muted">Top Category</small>
            <div className="h6 mt-1">{recs?.topCategories?.[0] || '—'}</div>
          </div>
        </div>
        <div className="col-sm-3">
          <div className="card p-3">
            <small className="text-muted">Preferred Diets</small>
            <div className="h6 mt-1">{(recs?.preferredDiets && recs.preferredDiets.join(', ')) || 'None'}</div>
          </div>
        </div>

        <div className="col-12">
          <div className="card p-3">
            <small className="text-muted">Top Searches</small>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {(recs?.topSearches || []).map((s, i) => (
                <button key={i} className="btn btn-sm btn-outline-primary" onClick={() => onSearch && onSearch(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card p-3">
            <small className="text-muted">Top Cuisines</small>
            <div className="d-flex flex-wrap gap-2 mt-2">
              {(recs?.topAreas || []).map((a, i) => (
                <button key={i} className="btn btn-sm btn-outline-success" onClick={() => onSearch && onSearch(a)}>{a}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
