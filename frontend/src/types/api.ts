export interface AptPriceRequest {
  address: string
}

export interface AptInfo {
  aptName: string
  address: string
  dealAmount: number
  exclusiveArea: number
  dealYear: number
  dealMonth: number
  dealDay: number
  floor: number
}

export interface AptPriceResponse {
  address: string
  aptInfos: AptInfo[]
}
