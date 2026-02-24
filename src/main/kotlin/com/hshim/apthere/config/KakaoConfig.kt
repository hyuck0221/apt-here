package com.hshim.apthere.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "kakao")
data class KakaoConfig(
    var apiKey: String = "",
)
