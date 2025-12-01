import React, { useState, useEffect } from 'react'
import { estimateRecipeNutrition } from '../helpers/nutritionHelper'

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
  const [checked, setChecked] = useState(() => ingredients.map(() => false))
  const [stepMode, setStepMode] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [nutrition, setNutrition] = useState(null)
  const [loadingNutrition, setLoadingNutrition] = useState(false)
  const [showNutrition, setShowNutrition] = useState(false)

  // Fetch nutrition data on component mount
  useEffect(() => {
    const fetchNutrition = async () => {
      setLoadingNutrition(true)
      try {
        const data = await estimateRecipeNutrition(ingredients)
        setNutrition(data)
      } catch (error) {
        console.error('Error fetching nutrition:', error)
      } finally {
        setLoadingNutrition(false)
      }
    }

    if (ingredients.length > 0) {
      fetchNutrition()
    }
  }, [ingredients])

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

  const startCooking = () => { setStepMode(true); setStepIndex(0) }
  const exitCooking = () => { setStepMode(false); setStepIndex(0) }
  const nextStep = () => setStepIndex(i => Math.min(i+1, Math.max(0, ingredients.length-1)))
  const prevStep = () => setStepIndex(i => Math.max(i-1, 0))

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        <div className="modal-content p-3">
          <div className="d-flex justify-content-between align-items-start">
            <h4>{meal.strMeal}</h4>
            <div>
              {!stepMode && <button className="btn btn-sm btn-success me-2" onClick={startCooking}>Start Cooking</button>}
              {stepMode && <button className="btn btn-sm btn-secondary me-2" onClick={exitCooking}>Exit Cooking</button>}
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
              {!stepMode && (
                <>
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
                    <button className="btn btn-outline-info" onClick={() => setShowNutrition(!showNutrition)}>
                      {showNutrition ? 'Hide Nutrition' : 'Show Nutrition'} {nutrition && !loadingNutrition && '📊'}
                    </button>
                  </div>

                  {showNutrition && (
                    <div className="mt-3 border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                      <h6>Nutritional Breakdown (Estimated per recipe)</h6>
                      {loadingNutrition && <div className="spinner"></div>}
                      {!loadingNutrition && nutrition && (
                        <div className="row">
                          <div className="col-6">
                            <p><strong>Calories:</strong> ~{nutrition.estimatedCalories} kcal</p>
                            <p><strong>Protein:</strong> ~{nutrition.estimatedProtein}g</p>
                            <p><strong>Carbs:</strong> ~{nutrition.estimatedCarbs}g</p>
                            <p><strong>Fat:</strong> ~{nutrition.estimatedFat}g</p>
                          </div>
                          <div className="col-6">
                            <small className="text-muted">Ingredients analyzed: {nutrition.ingredientsAnalyzed}</small>
                            <p style={{ fontSize: '0.85em', marginTop: '1rem' }}>
                              <em>Estimates based on USDA FoodData. Actual values depend on specific brands and cooking methods.</em>
                            </p>
                          </div>
                        </div>
                      )}
                      {!loadingNutrition && !nutrition && (
                        <p className="text-muted">Unable to fetch nutrition data. Please try again later.</p>
                      )}
                    </div>
                  )}

                  <h5 className="mt-3">Instructions</h5>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{meal.strInstructions}</p>

                  {meal.strYoutube && (
                    <p>
                      <a href={meal.strYoutube} target="_blank" rel="noreferrer">Watch on YouTube</a>
                    </p>
                  )}
                </>
              )}

              {stepMode && (
                <div>
                  <h5>Step-by-step Cooking</h5>
                  <div className="border rounded p-3 mb-2">
                    <div className="small text-muted">Ingredient {stepIndex+1} of {Math.max(1, ingredients.length)}</div>
                    <div className="h5 mt-2">{ingredients[stepIndex]}</div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <button className="btn btn-outline-secondary" onClick={prevStep} disabled={stepIndex===0}>Previous</button>
                    <div>
                      <button className="btn btn-outline-primary me-2" onClick={prevStep} disabled={stepIndex===0}>Back</button>
                      <button className="btn btn-primary" onClick={nextStep} disabled={stepIndex===ingredients.length-1}>Next</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
