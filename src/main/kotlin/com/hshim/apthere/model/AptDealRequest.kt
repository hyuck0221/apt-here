package com.hshim.apthere.model

data class AptDealRequest(
    val address: String? = null,
    val lawdCd: String? = null,
    val dong: String = "",
    val aptName: String? = null,
)
