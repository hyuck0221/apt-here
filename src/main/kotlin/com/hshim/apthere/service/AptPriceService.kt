package com.hshim.apthere.service

import com.hshim.apthere.config.PublicDataConfig
import com.hshim.apthere.model.*
import org.springframework.core.ParameterizedTypeReference
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.util.UriComponentsBuilder
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class AptPriceService(
    private val apisIsRestClient: RestClient,
    private val publicDataConfig: PublicDataConfig,
) {
    private val publicDataRestClient = RestClient.create()

    fun findAptPrices(request: AptPriceRequest): AptPriceResponse {
        val lawdCd = request.lawdCd ?: fetchLawdCd(request.address)
        val dealYmd = request.dealYmd ?: LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"))

        val rentData = fetchAptRentData(lawdCd.take(5), dealYmd)

        return AptPriceResponse(
            lawdCd = lawdCd,
            dealYmd = dealYmd,
            totalCount = rentData.response?.body?.totalCount ?: 0,
            items = mapToAptRentItems(rentData),
        )
    }

    private fun fetchLawdCd(address: String): String {
        val response = apisIsRestClient.get()
            .uri { builder ->
                builder.path("/area-codes")
                    .queryParam("address", address)
                    .queryParam("page", 0)
                    .queryParam("size", 1)
                    .build()
            }
            .retrieve()
            .body(object : ParameterizedTypeReference<APIsisEnvelope<AreaCodePagePayload>>() {})

        return response?.payload?.content?.firstOrNull()?.code
            ?: throw IllegalArgumentException("주소에 해당하는 법정동코드를 찾을 수 없습니다: $address")
    }

    private fun fetchAptRentData(lawdCd5: String, dealYmd: String): PublicDataResponse {
        // serviceKey는 application.yml에 디코딩된(raw) 키를 저장 → UriComponentsBuilder가 인코딩 처리
        val uri = UriComponentsBuilder
            .fromUriString(publicDataConfig.baseUrl)
            .path("/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent")
            .queryParam("serviceKey", publicDataConfig.serviceKey)
            .queryParam("LAWD_CD", lawdCd5)
            .queryParam("DEAL_YMD", dealYmd)
            .queryParam("_type", "json")
            .queryParam("numOfRows", 100)
            .queryParam("pageNo", 1)
            .build()
            .toUri()

        return publicDataRestClient.get()
            .uri(uri)
            .retrieve()
            .body(PublicDataResponse::class.java)
            ?: PublicDataResponse()
    }

    @Suppress("UNCHECKED_CAST")
    private fun mapToAptRentItems(data: PublicDataResponse): List<AptRentItem> {
        val raw = data.response?.body?.items?.item ?: return emptyList()

        // Jackson이 Any?로 역직렬화: 다건 → List<Map>, 단건 → Map, 없으면 → String
        val maps: List<Map<String, Any?>> = when (raw) {
            is List<*> -> raw.filterIsInstance<Map<String, Any?>>()
            is Map<*, *> -> listOf(raw as Map<String, Any?>)
            else -> return emptyList()
        }

        return maps.map { m ->
            val month = m["dealMonth"]?.toString()?.padStart(2, '0') ?: "01"
            val day = m["dealDay"]?.toString()?.padStart(2, '0') ?: "01"
            val monthlyRentStr = m["monthlyRent"]?.toString() ?: "0"
            AptRentItem(
                aptName = m["aptNm"]?.toString() ?: "",
                floor = m["floor"]?.toString() ?: "",
                area = m["excluUseAr"]?.toString() ?: "",
                rentType = if (monthlyRentStr == "0") "전세" else "월세",
                deposit = m["deposit"]?.toString()?.trim() ?: "",
                monthlyRent = monthlyRentStr,
                dealDate = "${m["dealYear"]}-$month-$day",
                buildYear = m["buildYear"]?.toString() ?: "",
                dong = m["umdNm"]?.toString()?.trim() ?: "",
                contractType = m["contractType"]?.toString()?.trim() ?: "",
                useRRRight = m["useRRRight"]?.toString()?.trim() ?: "",
            )
        }
    }
}
