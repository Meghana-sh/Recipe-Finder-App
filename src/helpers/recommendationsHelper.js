// Personalized recommendations engine
// Tracks user behavior (searches, favorites, dietary preferences) and suggests recipes

const HISTORY_KEY = 'rf_user_history'

export const trackUserAction = (action, data) => {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {
      searches: [],
      favoriteCount: 0,
      dietaryPreferences: { vegetarian: 0, vegan: 0, glutenFree: 0 },
      categories: {},
      areas: {},
      lastUpdated: Date.now()
    }

    switch (action) {
      case 'search':
        history.searches = [data, ...history.searches.filter(s => s !== data)].slice(0, 50)
        break
      case 'favorite':
        history.favoriteCount += 1
        break
      case 'dietaryFilter':
        history.dietaryPreferences[data] = (history.dietaryPreferences[data] || 0) + 1
        break
      case 'category':
        history.categories[data] = (history.categories[data] || 0) + 1
        break
      case 'area':
        history.areas[data] = (history.areas[data] || 0) + 1
        break
    }

    history.lastUpdated = Date.now()
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('Error tracking user action:', e)
  }
}

export const getUserHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || null
  } catch (e) {
    return null
  }
}

export const getRecommendations = () => {
  const history = getUserHistory()
  if (!history || history.searches.length === 0) return null

  const recommendations = {
    topSearches: history.searches.slice(0, 5),
    topCategories: Object.entries(history.categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat),
    topAreas: Object.entries(history.areas)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([area]) => area),
    preferredDiets: Object.entries(history.dietaryPreferences)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([diet]) => diet),
    searchCount: history.searches.length,
    favoritesCount: history.favoriteCount
  }

  return recommendations
}

// Generate personalized suggestion text based on user history
export const getPersonalizedMessage = () => {
  const history = getUserHistory()
  if (!history) return 'Start searching to get personalized recommendations!'

  if (history.searches.length < 3) {
    return `You've searched ${history.searches.length} recipe. Keep exploring to unlock personalized recommendations!`
  }

  const topSearch = history.searches[0]
  const stats = getRecommendations()

  if (history.dietaryPreferences.vegan > 0) {
    return `You seem to love vegan recipes! Try searching "${topSearch}" with vegan filter.`
  }
  if (history.dietaryPreferences.vegetarian > 0) {
    return `Vegetarian enthusiast? Explore "${topSearch}" with our vegetarian filter.`
  }
  if (stats.topCategories.length > 0) {
    return `Based on your ${stats.topCategories[0]} searches, you might enjoy exploring related recipes.`
  }

  return `You've explored ${stats.searchCount} recipes! Here are some recommendations based on your favorites.`
}

// Clear user history
export const clearUserHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (e) {
    console.error('Error clearing history:', e)
  }
}
