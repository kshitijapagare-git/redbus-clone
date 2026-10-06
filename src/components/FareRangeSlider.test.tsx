import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import FareRangeSlider from './FareRangeSlider'

describe('FareRangeSlider', () => {
  it('renders two range inputs bounded by min/max', () => {
    render(<FareRangeSlider min={100} max={1000} valueMin={200} valueMax={800} onChange={vi.fn()} />)
    const minInput = screen.getByRole('slider', { name: 'Minimum fare' }) as HTMLInputElement
    const maxInput = screen.getByRole('slider', { name: 'Maximum fare' }) as HTMLInputElement
    expect(minInput.min).toBe('100')
    expect(minInput.max).toBe('1000')
    expect(maxInput.min).toBe('100')
    expect(maxInput.max).toBe('1000')
    expect(minInput.value).toBe('200')
    expect(maxInput.value).toBe('800')
  })

  it('increases the low handle value with ArrowUp/ArrowRight and calls onChange', () => {
    const onChange = vi.fn()
    render(<FareRangeSlider min={100} max={1000} valueMin={200} valueMax={800} onChange={onChange} />)
    const minInput = screen.getByRole('slider', { name: 'Minimum fare' })
    fireEvent.change(minInput, { target: { value: '210' } })
    expect(onChange).toHaveBeenCalledWith(210, 800)
  })

  it('decreases the low handle value with ArrowDown/ArrowLeft and calls onChange', () => {
    const onChange = vi.fn()
    render(<FareRangeSlider min={100} max={1000} valueMin={200} valueMax={800} onChange={onChange} />)
    const minInput = screen.getByRole('slider', { name: 'Minimum fare' })
    fireEvent.change(minInput, { target: { value: '190' } })
    expect(onChange).toHaveBeenCalledWith(190, 800)
  })

  it('clamps the low handle so it never exceeds the current high handle value', () => {
    const onChange = vi.fn()
    render(<FareRangeSlider min={100} max={1000} valueMin={200} valueMax={800} onChange={onChange} />)
    const minInput = screen.getByRole('slider', { name: 'Minimum fare' })
    fireEvent.change(minInput, { target: { value: '900' } })
    expect(onChange).toHaveBeenCalledWith(800, 800)
  })

  it('clamps the high handle so it never goes below the current low handle value', () => {
    const onChange = vi.fn()
    render(<FareRangeSlider min={100} max={1000} valueMin={200} valueMax={800} onChange={onChange} />)
    const maxInput = screen.getByRole('slider', { name: 'Maximum fare' })
    fireEvent.change(maxInput, { target: { value: '100' } })
    expect(onChange).toHaveBeenCalledWith(200, 200)
  })

  it('is usable via the keyboard alone: both handles are focusable', () => {
    render(<FareRangeSlider min={100} max={1000} valueMin={200} valueMax={800} onChange={vi.fn()} />)
    const minInput = screen.getByRole('slider', { name: 'Minimum fare' })
    const maxInput = screen.getByRole('slider', { name: 'Maximum fare' })
    minInput.focus()
    expect(minInput).toHaveFocus()
    maxInput.focus()
    expect(maxInput).toHaveFocus()
  })
})
