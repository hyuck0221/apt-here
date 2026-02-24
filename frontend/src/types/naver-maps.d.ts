// Naver Maps v3 TypeScript declarations
// https://navermaps.github.io/maps.js.ncp/

declare namespace naver.maps {
  class Map {
    constructor(mapDiv: HTMLElement | string, options?: MapOptions)
    addListener(eventName: string, handler: (...args: unknown[]) => void): MapEventListener
    getCenter(): LatLng
    setCenter(latlng: LatLng): void
    getZoom(): number
    setZoom(zoom: number): void
    getBounds(): LatLngBounds | null
  }

  class LatLngBounds {
    hasLatLng(latlng: LatLng): boolean
    extend(latlng: LatLng): void
    getNE(): LatLng
    getSW(): LatLng
  }

  class Marker {
    constructor(options?: MarkerOptions)
    setMap(map: Map | null): void
    getPosition(): LatLng
    setPosition(latlng: LatLng): void
    addListener(eventName: string, handler: (...args: unknown[]) => void): MapEventListener
  }

  class LatLng {
    constructor(lat: number, lng: number)
    lat(): number
    lng(): number
  }

  interface MapOptions {
    center?: LatLng
    zoom?: number
    mapTypeId?: string
    disableDoubleClickZoom?: boolean
    disableKineticPan?: boolean
    mapDataControl?: boolean
    scaleControl?: boolean
    logoControl?: boolean
    logoControlOptions?: { position: Position }
    mapTypeControl?: boolean
    zoomControl?: boolean
    zoomControlOptions?: { position: Position }
    tileSpare?: number
  }

  interface MarkerOptions {
    position?: LatLng
    map?: Map
    icon?: string | ImageIcon | SymbolIcon | HtmlIcon
    draggable?: boolean
    clickable?: boolean
    cursor?: string
    zIndex?: number
  }

  interface ImageIcon {
    url: string
    size?: Size
    scaledSize?: Size
    origin?: Point
    anchor?: Point
  }

  interface SymbolIcon {
    path: string | SymbolPath
    fillColor?: string
    fillOpacity?: number
    strokeColor?: string
    strokeWeight?: number
    scale?: number
    anchor?: Point
  }

  interface HtmlIcon {
    content: string
    size?: Size
    anchor?: Point
  }

  class Size {
    constructor(width: number, height: number)
  }

  class Point {
    constructor(x: number, y: number)
  }

  type MapEventListener = unknown

  const enum Position {
    CENTER = 0,
    TOP_LEFT = 1,
    TOP_CENTER = 2,
    TOP_RIGHT = 3,
    LEFT_TOP = 4,
    LEFT_CENTER = 5,
    LEFT_BOTTOM = 6,
    BOTTOM_LEFT = 7,
    BOTTOM_CENTER = 8,
    BOTTOM_RIGHT = 9,
    RIGHT_TOP = 10,
    RIGHT_CENTER = 11,
    RIGHT_BOTTOM = 12,
  }

  namespace Event {
    function addListener(
      target: Map | Marker,
      eventName: string,
      listener: (...args: unknown[]) => void
    ): MapEventListener
    function removeListener(listener: MapEventListener): void
  }

  namespace Service {
    const Status: { readonly OK: string; readonly ERROR: string }

    function geocode(
      options: GeocodeOptions,
      callback: (status: string, response: GeocodeResponse) => void
    ): void

    type GeocodeStatus = string

    interface GeocodeOptions {
      query: string
      /** 검색 결과 우선순위 힌트 좌표. "경도,위도" 형식 (예: "127.0016,37.5642") */
      coordinate?: string
      filter?: string
    }

    /** 실제 Naver Maps SDK geocode 응답 — v2 래퍼 없이 최상위 */
    interface GeocodeResponse {
      status: string
      meta: { totalCount: number; page: number; count: number }
      addresses: Array<{
        roadAddress: string
        jibunAddress: string
        englishAddress: string
        /** 경도 (longitude) */
        x: string
        /** 위도 (latitude) */
        y: string
        distance: number
        addressElements: Array<{
          types: string[]
          longName: string
          shortName: string
          code: string
        }>
      }>
      errorMessage: string
    }

    function reverseGeocode(
      options: ReverseGeocodeOptions,
      callback: (status: ReverseGeocodeStatus, response: ReverseGeocodeResponse) => void
    ): void

    type ReverseGeocodeStatus = 'OK' | 'ERROR'

    interface ReverseGeocodeOptions {
      coords: LatLng
      orders?: string
    }

    interface ReverseGeocodeResponse {
      v2: {
        status: { code: number; name: string; message: string }
        /** 도로명/지번 주소 문자열 */
        address: {
          roadAddress: string
          jibunAddress: string
        }
        results: Array<{
          /** "legalcode" | "admcode" */
          name: string
          code: {
            /** 법정동코드 10자리 */
            id: string
            /** "L" = 법정동, "A" = 행정동 */
            type: 'L' | 'A' | string
            mappingId: string
          }
          region: {
            area0: { name: string }
            area1: { name: string; alias?: string }
            area2: { name: string }
            area3: { name: string }
            area4: { name: string }
          }
          land?: {
            type: string
            name: string
            number1: string
            number2: string
            addition0: { type: string; value: string }
            addition1: { type: string; value: string }
          }
        }>
      }
    }
  }
}

interface Window {
  naver: typeof naver
}
