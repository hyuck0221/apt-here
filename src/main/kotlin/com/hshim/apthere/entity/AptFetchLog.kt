package com.hshim.apthere.entity

import jakarta.persistence.*
import java.time.LocalDateTime

enum class ApiType { TRADE, RENT }

@Entity
@Table(
    name = "apt_fetch_log",
    uniqueConstraints = [UniqueConstraint(columnNames = ["lawd_cd5", "deal_ym", "api_type"])]
)
class AptFetchLog(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val lawdCd5: String,
    val dealYm: String,
    @Enumerated(EnumType.STRING)
    val apiType: ApiType,
    var fetchedAt: LocalDateTime = LocalDateTime.now(),
)
