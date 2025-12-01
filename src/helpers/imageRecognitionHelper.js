// Image-based ingredient recognition using TensorFlow.js + COCO-SSD
// Detects food items in images and suggests ingredients

let cocoModel = null
let modelLoading = false

const INGREDIENT_MAP = {
  'apple': 'apple',
  'banana': 'banana',
  'orange': 'orange',
  'broccoli': 'broccoli',
  'carrot': 'carrot',
  'hot dog': 'sausage',
  'pizza': 'flour',
  'donut': 'flour',
  'cake': 'flour',
  'sandwich': 'bread',
  'chicken': 'chicken',
  'cow': 'beef',
  'person': null, // skip
  'potted plant': null, // skip
  'cup': null, // skip
  'chair': null, // skip
  'backpack': null, // skip
  'handbag': null, // skip
  'sports ball': null, // skip
  'bottle': null, // skip
  'wine glass': null, // skip
  'fork': null, // skip
  'knife': null, // skip
  'spoon': null, // skip
  'bowl': null, // skip
  'dining table': null, // skip
}

const loadModel = async () => {
  if (cocoModel) return cocoModel
  if (modelLoading) return null

  modelLoading = true
  try {
    // Load TensorFlow.js and COCO-SSD
    if (!window.tf) {
      throw new Error('TensorFlow.js not loaded')
    }
    if (!window.cocoSsd) {
      throw new Error('COCO-SSD not loaded')
    }

    cocoModel = await window.cocoSsd.load()
    modelLoading = false
    return cocoModel
  } catch (error) {
    console.error('Failed to load model:', error)
    modelLoading = false
    return null
  }
}

export const detectIngredientsFromImage = async (imageElement) => {
  const model = await loadModel()
  if (!model) {
    throw new Error('Model not loaded. Please ensure TensorFlow.js and COCO-SSD are loaded.')
  }

  try {
    const predictions = await model.detect(imageElement)

    const ingredients = []
    const seenIngredients = new Set()

    predictions.forEach(pred => {
      const label = pred.class.toLowerCase()
      const confidence = pred.score

      // Only consider high-confidence predictions
      if (confidence > 0.5) {
        const mapped = INGREDIENT_MAP[label]

        // Map COCO label to ingredient, skip if mapped to null
        if (mapped !== undefined) {
          if (mapped !== null && !seenIngredients.has(mapped)) {
            ingredients.push({
              name: mapped,
              confidence: (confidence * 100).toFixed(0),
              cocoLabel: label
            })
            seenIngredients.add(mapped)
          }
        } else if (!seenIngredients.has(label)) {
          // If not in map, try to use the label directly if it seems like food
          if (isFoodLike(label)) {
            ingredients.push({
              name: label,
              confidence: (confidence * 100).toFixed(0),
              cocoLabel: label
            })
            seenIngredients.add(label)
          }
        }
      }
    })

    return {
      success: true,
      ingredients,
      rawPredictions: predictions
    }
  } catch (error) {
    console.error('Error detecting ingredients:', error)
    throw error
  }
}

const isFoodLike = (label) => {
  const foodKeywords = [
    'food', 'fruit', 'vegetable', 'meat', 'fish', 'bread', 'cheese', 'milk',
    'egg', 'rice', 'pasta', 'sauce', 'soup', 'salad', 'dessert', 'drink',
    'herb', 'spice', 'grain', 'seed', 'nut', 'bean', 'lentil'
  ]
  return foodKeywords.some(kw => label.includes(kw))
}

export const ensureTensorFlowLoaded = () => {
  return new Promise((resolve, reject) => {
    if (window.tf && window.cocoSsd) {
      resolve()
      return
    }

    // Load TensorFlow.js
    if (!window.tf) {
      const tfScript = document.createElement('script')
      tfScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0'
      tfScript.onload = () => {
        // Load COCO-SSD
        if (!window.cocoSsd) {
          const cocoScript = document.createElement('script')
          cocoScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3'
          cocoScript.onload = () => resolve()
          cocoScript.onerror = () => reject(new Error('Failed to load COCO-SSD'))
          document.head.appendChild(cocoScript)
        } else {
          resolve()
        }
      }
      tfScript.onerror = () => reject(new Error('Failed to load TensorFlow.js'))
      document.head.appendChild(tfScript)
    } else {
      // TF already loaded, just load COCO-SSD
      if (!window.cocoSsd) {
        const cocoScript = document.createElement('script')
        cocoScript.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3'
        cocoScript.onload = () => resolve()
        cocoScript.onerror = () => reject(new Error('Failed to load COCO-SSD'))
        document.head.appendChild(cocoScript)
      } else {
        resolve()
      }
    }
  })
}

export const clearModel = () => {
  if (cocoModel) {
    cocoModel.dispose()
    cocoModel = null
  }
}
