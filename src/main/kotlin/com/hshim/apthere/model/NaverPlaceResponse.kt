package com.hshim.apthere.model

import com.fasterxml.jackson.annotation.JsonProperty

data class NaverPlaceResponse(
    val documents: List<KakaoDocument> = emptyList(),
)

data class KakaoDocument(
    @JsonProperty("place_name")
    val placeName: String = "",
    @JsonProperty("address_name")
    val addressName: String = "",
    @JsonProperty("road_address_name")
    val roadAddressName: String = "",
    val x: String = "",   // 경도 (longitude)
    val y: String = "",   // 위도 (latitude)
    @JsonProperty("category_name")
    val categoryName: String = "",
)
