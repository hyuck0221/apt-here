package com.hshim.apthere.model

data class AptInfo(
    val aptName: String,
    val dong: String,
    val lat: Double,
    val lng: Double,
    val address: String,
    val lawdCd: String? = null,
)

data class AptListResponse(
    val apartments: List<AptInfo>,
)
