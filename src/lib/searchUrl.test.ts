import { describe, expect, it } from 'vitest'
import { buildSearchUrl } from './searchUrl'

describe('buildSearchUrl', () => {
  it('includes women=1 when forWomen is true', () => {
    const url = buildSearchUrl(1, 2, '2024-10-02', true)
    const [, query] = url.split('?')
    const params = new URLSearchParams(query)
    expect(params.get('women')).toBe('1')
  })

  it('omits the women key entirely when forWomen is false', () => {
    const url = buildSearchUrl(1, 2, '2024-10-02', false)
    const [, query] = url.split('?')
    const params = new URLSearchParams(query)
    expect(params.has('women')).toBe(false)
  })

  it('includes from, to and date', () => {
    const url = buildSearchUrl(1, 2, '2024-10-02', false)
    const [, query] = url.split('?')
    const params = new URLSearchParams(query)
    expect(params.get('from')).toBe('1')
    expect(params.get('to')).toBe('2')
    expect(params.get('date')).toBe('2024-10-02')
  })
})
