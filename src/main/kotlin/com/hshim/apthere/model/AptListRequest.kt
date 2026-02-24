package com.hshim.apthere.model

data class AptListRequest(
    val lat: Double,
    val lng: Double,
    val radius: Int = 1000,
)
