export interface FareRangeSliderProps {
  min: number
  max: number
  valueMin: number
  valueMax: number
  onChange: (min: number, max: number) => void
}

function FareRangeSlider({ min, max, valueMin, valueMax, onChange }: FareRangeSliderProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.min(Number(e.target.value), valueMax)
    onChange(next, valueMax)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = Math.max(Number(e.target.value), valueMin)
    onChange(valueMin, next)
  }

  return (
    <div className="fare-range-slider">
      <div className="fare-range-slider-values">
        <span>₹{valueMin}</span>
        <span>₹{valueMax}</span>
      </div>
      <div className="fare-range-slider-tracks">
        <input
          type="range"
          aria-label="Minimum fare"
          min={min}
          max={max}
          value={valueMin}
          onChange={handleMinChange}
        />
        <input
          type="range"
          aria-label="Maximum fare"
          min={min}
          max={max}
          value={valueMax}
          onChange={handleMaxChange}
        />
      </div>
    </div>
  )
}

export default FareRangeSlider
