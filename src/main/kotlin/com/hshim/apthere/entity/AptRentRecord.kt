package com.hshim.apthere.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "apt_rent_record",
    indexes = [Index(name = "idx_rent_lawd_ymd", columnList = "lawd_cd5, deal_ymd")]
)
class AptRentRecord(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val lawdCd5: String,
    val dealYmd: String,
    val aptName: String,
    val floor: String,
    val area: String,
    val rentType: String,
    val deposit: String,
    val monthlyRent: String,
    val dealDate: String,
    val buildYear: String,
    val dong: String,
    val contractType: String,
    val useRRRight: String,
)
