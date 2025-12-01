import React, { useState, useRef } from 'react'
import { detectIngredientsFromImage, ensureTensorFlowLoaded } from '../helpers/imageRecognitionHelper'

export default function ImageRecognition({ onIngredientsDetected, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [detected, setDetected] = useState([])
  const [preview, setPreview] = useState(null)
  const [selectedIngs, setSelectedIngs] = useState(new Set())
  const fileInputRef = useRef()
  const cameraInputRef = useRef()
  const canvasRef = useRef()

  const processImage = async (img) => {
    setLoading(true)
    setError('')
    setDetected([])

    try {
      await ensureTensorFlowLoaded()
      const result = await detectIngredientsFromImage(img)

      if (result.success) {
        setDetected(result.ingredients)
        setSelectedIngs(new Set(result.ingredients.map(ing => ing.name)))
      } else {
        setError('No ingredients detected. Try a clearer food image.')
      }
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setPreview(event.target.result)
        processImage(img)
      }
      img.onerror = () => setError('Failed to load image')
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      setTimeout(() => {
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext('2d')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)
          setPreview(canvas.toDataURL('image/jpeg'))

          const img = new Image()
          img.onload = () => processImage(img)
          img.src = canvas.toDataURL('image/jpeg')
        }

        stream.getTracks().forEach(track => track.stop())
      }, 1000)
    } catch (err) {
      setError(`Camera error: ${err.message}`)
    }
  }

  const toggleIngredient = (name) => {
    const updated = new Set(selectedIngs)
    if (updated.has(name)) {
      updated.delete(name)
    } else {
      updated.add(name)
    }
    setSelectedIngs(updated)
  }

  const addToSearch = () => {
    const selected = Array.from(selectedIngs)
    if (selected.length > 0) {
      onIngredientsDetected(selected)
      onClose()
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-lg">
        <div className="modal-content p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h5>Detect Ingredients from Image</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {!preview && (
            <div className="text-center mb-4">
              <p className="text-muted mb-3">Upload a photo or use your camera to detect ingredients</p>
              <div className="d-flex gap-2 justify-content-center mb-3">
                <button
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload an image file"
                >
                  📷 Upload Image
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={handleCamera}
                  title="Take a photo with your camera"
                >
                  📹 Use Camera
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}

          {preview && (
            <div className="mb-3">
              <img src={preview} alt="Preview" className="img-fluid rounded mb-2" style={{ maxHeight: '300px' }} />
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setPreview(null)
                  setDetected([])
                  setSelectedIngs(new Set())
                }}
              >
                Try Another Image
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center">
              <div className="spinner mb-2"></div>
              <p className="text-muted">Analyzing image...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-warning mb-3">{error}</div>
          )}

          {detected.length > 0 && !loading && (
            <div className="mb-3">
              <h6>Detected Ingredients ({detected.length})</h6>
              <div className="border rounded p-2" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {detected.map((ing, idx) => (
                  <div key={idx} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`ing-${idx}`}
                      checked={selectedIngs.has(ing.name)}
                      onChange={() => toggleIngredient(ing.name)}
                    />
                    <label className="form-check-label" htmlFor={`ing-${idx}`}>
                      {ing.name}
                      <span className="text-muted ms-2" style={{ fontSize: '0.85em' }}>
                        ({ing.confidence}% confidence)
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <small className="text-muted d-block mt-2">
                Select ingredients to add to pantry or search
              </small>
            </div>
          )}

          {detected.length === 0 && !loading && preview && !error && (
            <div className="alert alert-info">
              No clear food items detected. Try a clearer image or a different angle.
            </div>
          )}

          <div className="d-flex gap-2 justify-content-end mt-3">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={addToSearch}
              disabled={selectedIngs.size === 0 || loading}
            >
              Add {selectedIngs.size} Ingredient{selectedIngs.size !== 1 ? 's' : ''} to Search
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
