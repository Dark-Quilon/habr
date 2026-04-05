import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { route } from 'preact-router'

export default function SearchBar({ defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue)
  const timerRef = useRef(null)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const handleChange = (e) => {
    const next = e.target.value
    setValue(next)

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      if (next) {
        params.set('search', next)
      } else {
        params.delete('search')
      }
      params.delete('page')
      route(`/?${params.toString()}`)
    }, 300)
  }

  return (
    <input
      type="search"
      className="form-control"
      placeholder="Поиск статей..."
      value={value}
      onInput={handleChange}
      aria-label="Поиск"
    />
  )
}
