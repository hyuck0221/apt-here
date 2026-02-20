package com.hshim.apthere.model

data class PublicDataResponse(
    val response: PublicDataWrapper? = null,
)

data class PublicDataWrapper(
    val header: PublicDataHeader? = null,
    val body: PublicDataBodyContent? = null,
)

data class PublicDataHeader(
    val resultCode: String = "",
    val resultMsg: String = "",
)

data class PublicDataBodyContent(
    val items: AptRentItemsWrapper? = null,
    val numOfRows: Int = 0,
    val pageNo: Int = 0,
    val totalCount: Int = 0,
)

data class AptRentItemsWrapper(
    // 공공데이터 API 특성: 다건이면 List<Map>, 단건이면 Map, 없으면 String("")으로 역직렬화됨
    val item: Any? = null,
)

data class AptRentApiItem(
    val sggCd: String? = null,          // 지역코드 - e.g. "11530"
    val umdNm: String? = null,          // 법정동 - e.g. "고척동"
    val aptNm: String? = null,          // 아파트명
    val aptSeq: String? = null,         // 단지 일련번호 - e.g. "11530-3622"
    val jibun: String? = null,          // 지번 - e.g. "346"
    val excluUseAr: Double? = null,     // 전용면적 - e.g. 33.525
    val dealYear: Int? = null,          // 계약년도 - e.g. 2025
    val dealMonth: Int? = null,         // 계약월 - e.g. 8
    val dealDay: Int? = null,           // 계약일 - e.g. 20
    val deposit: String? = null,        // 보증금액 (만원) - e.g. "15,500" (콤마 포함)
    val monthlyRent: Int? = null,       // 월세금액 (만원) - 0이면 전세
    val floor: Int? = null,             // 층 - e.g. 5
    val buildYear: Int? = null,         // 건축년도 - e.g. 2012
    val contractTerm: String? = null,   // 계약기간
    val contractType: String? = null,   // 계약구분 (신규/갱신)
    val useRRRight: String? = null,     // 갱신요구권사용
    val preDeposit: String? = null,     // 종전계약보증금
    val preMonthlyRent: String? = null, // 종전계약월세
    val roadnm: String? = null,         // 도로명 - e.g. "중앙로 85"
    val roadnmsggcd: String? = null,    // 도로명시군구코드 - e.g. "11530"
    val roadnmcd: String? = null,       // 도로명코드 - e.g. "3005068"
    val roadnmseq: Int? = null,         // 도로명일련번호코드 - e.g. 1
    val roadnmbcd: Int? = null,         // 도로명지상지하코드 - e.g. 0
    val roadnmbonbun: String? = null,   // 도로명건물본번호코드 - e.g. "00085" (앞자리 0 보존)
    val roadnmbubun: String? = null,    // 도로명건물부번호코드 - e.g. "00000" (앞자리 0 보존)
)
