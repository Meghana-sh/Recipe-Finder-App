import React from 'react'

function extractIngredients(meal) {
  const list = []
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    if (ing && ing.trim()) list.push(`${measure ? measure : ''} ${ing}`.trim())
  }
  return list
}

export default function RecipeModal({ meal, onClose }) {
  const ingredients = extractIngredients(meal)
  const [checked, setChecked] = React.useState(() => ingredients.map(() => false))

  const toggle = (i) => setChecked(c => c.map((v, idx) => idx === i ? !v : v))

  const exportShoppingList = () => {
    const items = ingredients.filter((_, idx) => checked[idx])
    const text = items.length ? items.join('\n') : ingredients.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${meal.strMeal || 'shopping-list'}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    const url = window.location.href + `?meal=${meal.idMeal}`
    try { await navigator.clipboard.writeText(url); alert('Link copied to clipboard') } catch (e) { alert('Copy failed') }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        <div className="modal-content p-3">
          <div className="d-flex justify-content-between align-items-start">
            <h4>{meal.strMeal}</h4>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-2" onClick={copyToClipboard}>Share</button>
              <button className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-5">
              <img src={meal.strMealThumb} className="img-fluid rounded" alt={meal.strMeal} loading="lazy" />
              <p className="mt-2"><strong>Category:</strong> {meal.strCategory}</p>
              <p><strong>Area:</strong> {meal.strArea}</p>
            </div>
            <div className="col-md-7">
              <h5>Ingredients</h5>
              <div>
                {ingredients.map((it, idx) => (
                  <div key={idx} className="form-check">
                    <input className="form-check-input" type="checkbox" id={`ing-${idx}`} checked={!!checked[idx]} onChange={() => toggle(idx)} />
                    <label className="form-check-label" htmlFor={`ing-${idx}`}>{it}</label>
                  </div>
                ))}
              </div>

              <div className="mt-3 d-flex gap-2">
                <button className="btn btn-outline-success" onClick={exportShoppingList}>Export Shopping List</button>
              </div>

              <h5 className="mt-3">Instructions</h5>
              <p style={{ whiteSpace: 'pre-wrap' }}>{meal.strInstructions}</p>

              {meal.strYoutube && (
                <p>
                  <a href={meal.strYoutube} target="_blank" rel="noreferrer">Watch on YouTube</a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
