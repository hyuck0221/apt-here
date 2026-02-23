package com.hshim.apthere.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "apt_fetch_meta",
    uniqueConstraints = [UniqueConstraint(columnNames = ["lawd_cd5", "deal_ymd"])]
)
class AptFetchMeta(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,
    val lawdCd5: String,
    val dealYmd: String,
    var fetchedAt: LocalDateTime = LocalDateTime.now(),
)
