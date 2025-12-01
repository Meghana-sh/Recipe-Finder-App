// Helper to fetch nutrition data from USDA FoodData Central API
// Free API, no key required; uses public search endpoint

const USDA_API = 'https://fdc.nal.usda.gov/api/foods/search'

// Cache for nutrition data to avoid repeated API calls
const nutritionCache = {}

export const searchNutritionData = async (ingredient) => {
  if (!ingredient || ingredient.trim().length === 0) return null

  const cacheKey = ingredient.toLowerCase().trim()
  if (nutritionCache[cacheKey]) {
    return nutritionCache[cacheKey]
  }

  try {
    const response = await fetch(`${USDA_API}?query=${encodeURIComponent(ingredient)}&pageSize=1`)
    const data = await response.json()

    if (data.foods && data.foods.length > 0) {
      const food = data.foods[0]
      const nutrition = parseNutritionData(food)
      nutritionCache[cacheKey] = nutrition
      return nutrition
    }
  } catch (error) {
    console.error('Error fetching nutrition data:', error)
  }

  return null
}

// Extract relevant nutrition info from USDA food entry
const parseNutritionData = (food) => {
  const nutrients = food.foodNutrients || []
  const getNutrient = (id) => {
    const n = nutrients.find(nt => nt.nutrientId === id)
    return n ? parseFloat(n.value).toFixed(1) : '0'
  }

  return {
    foodName: food.description,
    serving: '100g (standard serving)',
    calories: getNutrient(1008), // kcal
    protein: getNutrient(1003), // grams
    carbs: getNutrient(1005), // grams
    fat: getNutrient(1004), // grams
    fiber: getNutrient(1079), // grams
    sugar: getNutrient(2000), // grams
    calcium: getNutrient(1087), // mg
    iron: getNutrient(1089), // mg
    sodium: getNutrient(1093), // mg
    vitaminC: getNutrient(1162), // mg
    vitaminA: getNutrient(1104) // mcg
  }
}

// Estimate nutrition for a full recipe based on ingredients
export const estimateRecipeNutrition = async (ingredientsList) => {
  if (!ingredientsList || ingredientsList.length === 0) return null

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0
  let successCount = 0

  for (const ingredient of ingredientsList.slice(0, 15)) { // limit to first 15 to avoid too many API calls
    const nutrition = await searchNutritionData(ingredient)
    if (nutrition) {
      totalCalories += parseFloat(nutrition.calories) || 0
      totalProtein += parseFloat(nutrition.protein) || 0
      totalCarbs += parseFloat(nutrition.carbs) || 0
      totalFat += parseFloat(nutrition.fat) || 0
      successCount++
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50))
  }

  if (successCount === 0) return null

  // Average out to rough estimate (this is approximate, not precise)
  const factor = ingredientsList.length / successCount
  return {
    estimatedCalories: Math.round(totalCalories / successCount * factor),
    estimatedProtein: (totalProtein / successCount * factor).toFixed(1),
    estimatedCarbs: (totalCarbs / successCount * factor).toFixed(1),
    estimatedFat: (totalFat / successCount * factor).toFixed(1),
    ingredientsAnalyzed: successCount
  }
}

export const clearNutritionCache = () => {
  Object.keys(nutritionCache).forEach(key => delete nutritionCache[key])
}
