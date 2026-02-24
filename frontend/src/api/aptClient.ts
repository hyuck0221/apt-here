import type { AptDealRequest, AptDealResponse, AptListRequest, AptListResponse } from '../types/api'

export async function findAptDeals(request: AptDealRequest): Promise<AptDealResponse> {
  const response = await fetch('/api/apt/find', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error(`API 오류: ${response.status} ${response.statusText}`)
  return response.json() as Promise<AptDealResponse>
}

export async function listApts(request: AptListRequest): Promise<AptListResponse> {
  const response = await fetch('/api/apt/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error(`API 오류: ${response.status} ${response.statusText}`)
  return response.json() as Promise<AptListResponse>
}
