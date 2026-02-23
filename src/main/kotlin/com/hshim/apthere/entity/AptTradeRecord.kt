package com.hshim.apthere.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "apt_trade_record",
    indexes = [Index(name = "idx_trade_lawd_ymd", columnList = "lawd_cd5, deal_ymd")]
)
class AptTradeRecord(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val lawdCd5: String,
    val dealYmd: String,
    val aptName: String,
    val dong: String,
    val aptDong: String,
    val jibun: String,
    val floor: String,
    val area: String,
    val dealAmount: String,          // 거래금액 (만원, 콤마 포함)
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
