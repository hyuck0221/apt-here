package com.hshim.apthere.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpHeaders

@Configuration
@ConfigurationProperties(prefix = "apisis")
data class APIsisConfig(
    var baseUrl: String = "",
    var apiKey: String = "",
) {
    val headers: HttpHeaders
        get() = HttpHeaders().apply { set("X-API-KEY", apiKey) }
}