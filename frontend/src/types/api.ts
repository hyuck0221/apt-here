// ── 아파트 거래 조회 ──

export interface AptDealRequest {
  address?: string
  lawdCd?: string
  dong?: string
  aptName?: string
}

export interface TradeMonthlySummary {
  yearMonth: string      // "YYYYMM"
  count: number
  avgAmount: number | null  // 만원
}

export interface TradeItem {
  floor: string
  area: string
  dealAmount: number | null  // 만원
  dealDate: string
  dong: string
  aptDong: string
  dealingGbn: string
  cdealType: string
  cdealDay: string
  estateAgentSggNm: string
  rgstDate: string
  slerGbn: string
  buyerGbn: string
  landLeaseholdGbn: string
}

export interface AptDealTrade {
  totalCount: number
  monthlySummary: TradeMonthlySummary[]
  items: TradeItem[]
}

export interface RentMonthlySummary {
  yearMonth: string          // "YYYYMM"
  jeonseCount: number
  jeonseAvgDeposit: number | null  // 만원
  wolseCount: number
  wolseAvgDeposit: number | null   // 만원
  wolseAvgMonthly: number | null   // 만원
}

export interface RentItem {
  floor: string
  area: string
  rentType: string           // "JEONSE" | "WOLSE"
  deposit: number | null     // 만원
  monthlyRent: number | null // 만원
  dealDate: string
  contractType: string
  useRRRight: string
}

export interface AptDealRent {
  totalCount: number
  jeonseCount: number
  wolseCount: number
  monthlySummary: RentMonthlySummary[]
  items: RentItem[]
}

export interface AptDealResponse {
  lawdCd: string
  aptName: string
  dong: string
  buildYear: string
  trade: AptDealTrade
  rent: AptDealRent
}

// ── 아파트 목록 조회 ──

export interface AptInfo {
  aptName: string
  dong: string
  lat: number
  lng: number
  address: string
  lawdCd?: string
}

export interface AptListRequest {
  lat: number
  lng: number
  radius?: number
}

export interface AptListResponse {
  apartments: AptInfo[]
}
