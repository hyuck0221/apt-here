package com.hshim.apthere.model

data class AptTradeResponse(
    val lawdCd: String,
    val dealYmd: String,
    val totalCount: Int,
    val items: List<AptTradeItem>,
)

data class AptTradeItem(
    val aptName: String,
    val dong: String,
    val aptDong: String,
    val jibun: String,
    val floor: String,
    val area: String,
    val dealAmount: String,          // 거래금액 (만원)
    val dealDate: String,            // YYYY-MM-DD
    val buildYear: String,
    val cdealType: String,           // 해제여부
    val cdealDay: String,            // 해제사유발생일
    val dealingGbn: String,          // 거래유형
    val estateAgentSggNm: String,    // 중개사소재지
    val rgstDate: String,            // 등기일자
    val slerGbn: String,             // 매도자
    val buyerGbn: String,            // 매수자
    val landLeaseholdGbn: String,    // 토지임대부
)
