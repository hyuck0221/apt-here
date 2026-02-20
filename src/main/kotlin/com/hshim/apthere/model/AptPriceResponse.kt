package com.hshim.apthere.model

data class AptPriceResponse(
    val lawdCd: String,
    val dealYmd: String,
    val totalCount: Int,
    val items: List<AptRentItem>,
)

data class AptRentItem(
    val aptName: String,
    val floor: String,
    val area: String,
    val rentType: String,        // 전세 / 월세 (monthlyRent == 0이면 전세)
    val deposit: String,         // 보증금액 (만원)
    val monthlyRent: String,     // 월세금액 (만원, 전세이면 0)
    val dealDate: String,        // 계약일 (YYYY-MM-DD)
    val buildYear: String,
    val dong: String,            // 법정동
    val contractType: String,    // 계약구분 (신규/갱신)
    val useRRRight: String,      // 갱신요구권사용
)
