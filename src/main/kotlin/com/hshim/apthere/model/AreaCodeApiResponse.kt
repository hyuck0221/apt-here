package com.hshim.apthere.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class APIsisEnvelope<T>(
    val title: String = "",
    val version: String = "",
    val current: Int = 0,
    val limit: Int? = null,
    val timestamp: String = "",
    val payload: T? = null,
    val processMs: Long = 0,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AreaCodePagePayload(
    val content: List<AreaCodeItem> = emptyList(),
    val totalElements: Long = 0,
    val empty: Boolean = true,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class AreaCodeItem(
    val address: String = "",
    val city: String = "",
    val code: String = "",
    val town: String? = null,
    val village: String? = null,
)
