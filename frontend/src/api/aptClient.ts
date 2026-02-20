import type { AptPriceRequest, AptPriceResponse } from '../types/api'

export async function findAptPrices(request: AptPriceRequest): Promise<AptPriceResponse> {
  const response = await fetch('/api/apt/find', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`API 오류: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<AptPriceResponse>
}
