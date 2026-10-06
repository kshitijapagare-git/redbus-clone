import { useMemo, useState } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { City } from '../types'

export interface CityAutocompleteProps {
  id: string
  label: string
  cities: City[]
  value: City['id'] | null
  onChange: (id: City['id'] | null) => void
}

function filterCities(cities: City[], text: string): City[] {
  if (text.length < 1) return []
  const query = text.toLowerCase()
  return cities.filter((city) => city.name.toLowerCase().includes(query))
}

function CityAutocomplete({ id, label, cities, value, onChange }: CityAutocompleteProps) {
  // What the user has typed since the last selection. Used for display only
  // while no city is selected (value is null) — once a city is selected the
  // displayed text is always derived from `value`, so it reflects an
  // externally-driven change (e.g. a swap in the parent) without needing an
  // effect to keep local state in sync.
  const [typedText, setTypedText] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const selectedCity = value !== null ? cities.find((c) => c.id === value) : undefined
  const displayText = selectedCity ? selectedCity.name : typedText

  const filteredCities = useMemo(() => filterCities(cities, displayText), [cities, displayText])
  const listboxId = `${id}-listbox`
  const showListbox = isOpen && filteredCities.length > 0
  const activeOptionId =
    showListbox && filteredCities[activeIndex] ? `${id}-option-${activeIndex}` : undefined

  const selectCity = (city: City) => {
    // Once selected, the displayed name comes from `value`. Clear the typed
    // text so a later external reset to null (e.g. a swap with an empty
    // field) shows an empty input rather than this city's stale name.
    setTypedText('')
    onChange(city.id)
    setIsOpen(false)
    setActiveIndex(0)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    setTypedText(newText)
    onChange(null)
    const matches = filterCities(cities, newText)
    setIsOpen(matches.length > 0)
    setActiveIndex(0)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && filteredCities.length > 0) {
        e.preventDefault()
        setIsOpen(true)
        setActiveIndex(0)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filteredCities.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const city = filteredCities[activeIndex]
      if (city) selectCity(city)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
    }
  }

  const handleFocus = () => {
    const matches = filterCities(cities, displayText)
    if (matches.length > 0) {
      setIsOpen(true)
    }
  }

  const handleBlur = () => {
    setIsOpen(false)
  }

  return (
    <div className="combobox">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={showListbox}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        aria-label={label}
        placeholder={label}
        value={displayText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete="off"
      />
      {showListbox && (
        <ul role="listbox" id={listboxId} className="combobox-listbox">
          {filteredCities.map((city, idx) => (
            <li
              key={city.id}
              id={`${id}-option-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              className={`combobox-option${idx === activeIndex ? ' active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                selectCity(city)
              }}
            >
              <span className="combobox-option-name">{city.name}</span>
              <span className="combobox-option-state">{city.state}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CityAutocomplete
