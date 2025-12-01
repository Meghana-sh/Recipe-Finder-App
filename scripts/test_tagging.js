// Quick test harness for normalization and tagging
// Mirrors logic from src/RecipeApp.jsx

function normalizeIngredient(s) {
  if (!s) return ''
  let t = String(s).toLowerCase()
  t = t.replace(/\(.*?\)/g, ' ')
  t = t.replace(/\d+\/\d+|\d+/g, ' ')
  t = t.replace(/\b(tbsps?|tbsp|tsp|teaspoons?|tablespoons?|cups?|kg|g|grams?|oz|ounce|ounces|ml|l|pinch|clove|cloves|slice|slices|strip|strips|can|cans|package|packages|stick|sticks)\b/g, ' ')
  t = t.replace(/[^a-z\s]/g, ' ')
  t = t.replace(/\s+/g, ' ').trim()
  if (t.endsWith('ies')) t = t.replace(/ies$/, 'y')
  else if (t.endsWith('ses')) t = t.replace(/ses$/, 's')
  else if (t.endsWith('s')) t = t.slice(0, -1)
  return t
}

function tagFromIngredients(ingredientsList) {
  const all = (ingredientsList || []).map(i => normalizeIngredient(i)).join(' ')

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
  Object.keys(mapping).forEach(k => {
    norm = norm.replace(new RegExp(`\\b${k}\\b`, 'g'), mapping[k])
  })

  const stopwords = [
    'fresh', 'dried', 'minced', 'chopped', 'large', 'small', 'ground', 'to', 'taste', 'optional', 'slice', 'slices',
    'finely', 'roughly', 'peeled', 'seeded', 'grated', 'zest', 'juice', 'packed', 'softened', 'room', 'temperature',
    'beaten', 'divided', 'halved', 'trimmed', 'rinsed', 'drained', 'drained and patted dry', 'for serving', 'garnish',
    'about', 'approximately', 'cup', 'cups', 'tbsp', 'tsp', 'tablespoon', 'tablespoons', 'teaspoon', 'teaspoons'
  ]
  stopwords.forEach(w => { norm = norm.replace(new RegExp(`\\b${w}\\b`, 'g'), ' ') })
  norm = norm.replace(/\s+/g, ' ').trim()

  const meatRe = /\b(chicken|beef|pork|lamb|bacon|ham|anchovy|anchovies|fish|salmon|tuna|shrimp|prawn|crab|lobster|turkey|duck|sausage|veal|prosciutto|pepperoni|salami|mackerel|sardine|octopus|squid)\b/
  const dairyRe = /\b(egg|eggs|milk|cheese|butter|cream|yogurt|ghee|paneer|custard|yoghurt|honey)\b/
  const glutenRe = /\b(flour|wheat|breadcrumbs|pasta|noodle|noodles|cracker|soy sauce|barley|rye|semolina|couscous|bulgur)\b/

  const hasMeat = meatRe.test(norm)
  const hasDairy = dairyRe.test(norm)
  const hasGluten = glutenRe.test(norm)

  const isVegetarian = !hasMeat
  const isVegan = !hasMeat && !hasDairy
  const isGlutenFree = !hasGluten

  return { norm, isVegetarian, isVegan, isGlutenFree }
}

// Sample inputs to exercise tagging
const samples = [
  ['2 cups all purpose flour', '1 cup milk', '2 eggs', '1 tbsp sugar'],
  ['200g prawns', '1 tbsp fish sauce', '2 cloves garlic'],
  ['1 cup vegetable stock', '2 bell peppers, chopped', 'onion', 'cilantro'],
  ['3 tbsp soy sauce', '100g chicken breast', 'spring onions'],
  ['breadcrumbs', 'egg', 'parmesan cheese', 'butter'],
  ['plain flour', 'water', 'salt'],
  ['mayonnaise', 'lemon juice', 'garlic'],
  ['cornstarch', 'soy sauce', 'sugar'],
  ['flour (all-purpose)', 'baking powder', 'milk']
]

console.log('Tagging test results:\n')
for (const s of samples) {
  const res = tagFromIngredients(s)
  console.log('Ingredients:', s)
  console.log('Normalized:', res.norm)
  console.log('Tags:', { vegetarian: res.isVegetarian, vegan: res.isVegan, glutenFree: res.isGlutenFree })
  console.log('---')
}
