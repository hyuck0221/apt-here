package com.hshim.apthere.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestClient

@Configuration
class RestClientConfig(
    private val apisIsConfig: APIsisConfig,
) {
    @Bean
    fun apisIsRestClient(): RestClient = RestClient.builder()
        .baseUrl(apisIsConfig.baseUrl)
        .defaultHeaders { it.addAll(apisIsConfig.headers) }
        .build()
}
