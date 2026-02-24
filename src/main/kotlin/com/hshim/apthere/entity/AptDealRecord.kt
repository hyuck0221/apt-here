package com.hshim.apthere.entity

import jakarta.persistence.*
import java.time.LocalDateTime

enum class DealType { TRADE, JEONSE, WOLSE }

@Entity
@Table(
    name = "apt_deal_record",
    indexes = [
        Index(name = "idx_deal_lawd_ym", columnList = "lawd_cd5, deal_ym"),
        Index(name = "idx_deal_lawd_ym_type", columnList = "lawd_cd5, deal_ym, deal_type"),
    ]
)
class AptDealRecord(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val lawdCd5: String,
    val dealYm: String,
    @Enumerated(EnumType.STRING)
    val dealType: DealType,
    val aptName: String,
    val dong: String,
    val aptDong: String = "",
    val jibun: String = "",
    val floor: String,
    val area: String,
    val dealAmount: Long? = null,
    val dealingGbn: String = "",
    val estateAgentSggNm: String = "",
    val rgstDate: String = "",
    val slerGbn: String = "",
    val buyerGbn: String = "",
    val landLeaseholdGbn: String = "",
    val cdealType: String = "",
    val cdealDay: String = "",
    val deposit: Long? = null,
    val monthlyRent: Long? = null,
    val contractType: String = "",
    val useRRRight: String = "",
    val dealDate: String,
    val buildYear: String,
    val createdAt: LocalDateTime = LocalDateTime.now(),
)
