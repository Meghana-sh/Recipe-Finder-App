import React, { useState, useEffect, useRef } from 'react'
import Fuse from 'fuse.js'

const RECENT_KEY = 'rf_recent_searches'

const COMMON_INGREDIENTS = [
  'chicken','beef','pork','fish','egg','rice','tomato','onion','garlic','butter','milk','flour','sugar','cheese','potato','carrot','mushroom','pepper','salt','olive oil','lemon'
]

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('')
  const [recent, setRecent] = useState([])
  const [open, setOpen] = useState(false)
  const [suggests, setSuggests] = useState([])
  const [listening, setListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const ref = useRef()
  const recognitionRef = useRef(null)

  const fuse = useRef(new Fuse(COMMON_INGREDIENTS.map(i=>({i})), { keys: ['i'], threshold: 0.4 }))

  // Initialize Web Speech API on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setVoiceSupported(true)
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onstart = () => {
        setListening(true)
      }

      recognitionRef.current.onresult = (event) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' '
        }
        setValue(transcript.trim())
      }

      recognitionRef.current.onend = () => {
        setListening(false)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setListening(false)
      }
    }
  }, [])

  useEffect(() => {
    const raw = localStorage.getItem(RECENT_KEY)
    if (raw) setRecent(JSON.parse(raw))
  }, [])

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current || ref.current.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => {
    if (!value) { setSuggests([]); return }
    const r = fuse.current.search(value).slice(0,6).map(x=>x.item.i)
    setSuggests(r)
  }, [value])

  const submit = (e) => {
    e && e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    // store recent (unique, front)
    const updated = [trimmed, ...recent.filter(r => r !== trimmed)].slice(0, 8)
    setRecent(updated)
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
    onSearch(trimmed)
    setOpen(false)
  }

  const choose = (r) => {
    setValue(r)
    setOpen(false)
    onSearch(r)
  }

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) return
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      setValue('') // clear input before listening
      recognitionRef.current.start()
    }
  }

  return (
    <div className="position-relative" ref={ref}>
      <form onSubmit={submit} className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Try ingredients (chicken, rice) or a dish name (pizza)"
          value={value}
          onChange={(e) => { setValue(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
        {voiceSupported && (
          <button
            type="button"
            className={`btn ${listening ? 'btn-danger' : 'btn-outline-secondary'}`}
            onClick={toggleVoiceSearch}
            title="Voice search (click to speak)"
          >
            🎤
          </button>
        )}
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>

      {open && (
        <div className="list-group position-absolute w-100 shadow-sm mt-1 z-50" style={{ maxHeight: 220, overflow: 'auto' }}>
          {value && suggests.map((s, idx) => (
            <button key={idx} className="list-group-item list-group-item-action" onClick={() => choose(s)}>{s}</button>
          ))}

          {!value && recent && recent.length > 0 && recent.map((r, idx) => (
            <button key={idx} className="list-group-item list-group-item-action" onClick={() => choose(r)}>{r}</button>
          ))}
        </div>
      )}

      {listening && (
        <div className="alert alert-info mt-2 mb-0">
          <span className="voice-pulse">🎙️</span> Listening... Speak now
        </div>
      )}
    </div>
  )
}
