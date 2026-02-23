package com.hshim.apthere.model

data class AptPriceRequest(
    val address: String,
    val lawdCd: String? = null,  // 법정동코드 (네이버지도 API에서 받으면 area-codes 조회 생략)
    val dealYmd: String? = null, // 계약년월 YYYYMM (미입력 시 현재 월)
    val dong: String,    // 법정동명 (예: "역삼동") — 지정 시 해당 동만 반환
)
