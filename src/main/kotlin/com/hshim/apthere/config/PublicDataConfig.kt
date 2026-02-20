package com.hshim.apthere.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "public-data")
data class PublicDataConfig(
    var baseUrl: String = "http://apis.data.go.kr",
    var serviceKey: String = "", // 공공데이터포털 디코딩된 인증키
)
