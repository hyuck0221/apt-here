export interface AptPriceRequest {
  address: string
  dong?: string
}

export interface AptRentItem {
  aptName: string
  floor: string
  area: string
  rentType: string      // "전세" | "월세"
  deposit: string       // 보증금 (만원, 쉼표 포함 가능: "50,000")
  monthlyRent: string   // 월세 (만원, 전세이면 "0")
  dealDate: string      // "YYYY-MM-DD"
  buildYear: string
  dong: string          // 법정동
  contractType: string  // "신규" | "갱신"
  useRRRight: string    // 갱신요구권 사용 여부
}

export interface AptPriceResponse {
  lawdCd: string
  dealYmd: string
  totalCount: number
  items: AptRentItem[]
}
