package com.hshim.apthere.service

import com.hshim.apthere.config.PublicDataConfig
import com.hshim.apthere.entity.AptTradeFetchMeta
import com.hshim.apthere.entity.AptTradeRecord
import com.hshim.apthere.model.*
import com.hshim.apthere.repository.AptTradeFetchMetaRepository
import com.hshim.apthere.repository.AptTradeRecordRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking
import org.springframework.core.ParameterizedTypeReference
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.util.UriComponentsBuilder
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class AptTradeService(
    private val apisisRestClient: RestClient,
    private val publicDataConfig: PublicDataConfig,
    private val aptTradeRecordRepository: AptTradeRecordRepository,
    private val aptTradeFetchMetaRepository: AptTradeFetchMetaRepository,
) {
    private val publicDataRestClient = RestClient.create()
    private val ymdFormatter = DateTimeFormatter.ofPattern("yyyyMM")

    fun findAptTrades(request: AptPriceRequest): AptTradeResponse {
        val lawdCd = request.lawdCd ?: fetchLawdCd(request.address)
        val lawdCd5 = lawdCd.take(5)
        val currentYmd = LocalDate.now().format(ymdFormatter)

        // 1년치 월 목록 (현재월 포함 12개월, 과거순)
        val months = (11 downTo 0).map { offset ->
            LocalDate.now().minusMonths(offset.toLong()).format(ymdFormatter)
        }

        // DB에서 조회 이력 조회
        val fetchedMetas = aptTradeFetchMetaRepository.findByLawdCd5AndDealYmdIn(lawdCd5, months)
            .associateBy { it.dealYmd }

        val today = LocalDate.now()

        // 조회 필요한 월 결정
        val missingMonths = months.filter { ymd ->
            val meta = fetchedMetas[ymd]
            when {
                meta == null -> true  // 조회 이력 없음
                ymd == currentYmd && meta.fetchedAt.toLocalDate() < today -> true  // 당월이고 오늘 미조회
                else -> false  // 과거 월 → 캐시 사용
            }
        }

        // 미조회 월을 코루틴으로 병렬 조회 및 저장
        if (missingMonths.isNotEmpty()) {
            runBlocking {
                missingMonths.map { ymd ->
                    async(Dispatchers.IO) { fetchAndSave(lawdCd5, ymd) }
                }.awaitAll()
            }
        }

        // DB에서 12개월 전체 조회
        val records = aptTradeRecordRepository.findByLawdCd5AndDealYmdInAndDong(lawdCd5, months, request.dong)

        val items = records
            .map { r ->
                AptTradeItem(
                    aptName = r.aptName,
                    dong = r.dong,
                    aptDong = r.aptDong,
                    jibun = r.jibun,
                    floor = r.floor,
                    area = r.area,
                    dealAmount = r.dealAmount,
                    dealDate = r.dealDate,
                    buildYear = r.buildYear,
                    cdealType = r.cdealType,
                    cdealDay = r.cdealDay,
                    dealingGbn = r.dealingGbn,
                    estateAgentSggNm = r.estateAgentSggNm,
                    rgstDate = r.rgstDate,
                    slerGbn = r.slerGbn,
                    buyerGbn = r.buyerGbn,
                    landLeaseholdGbn = r.landLeaseholdGbn,
                )
            }.sortedByDescending { it.dealDate }

        return AptTradeResponse(
            lawdCd = lawdCd,
            dealYmd = currentYmd,
            totalCount = items.size,
            items = items,
        )
    }

    private fun fetchAndSave(lawdCd5: String, dealYmd: String) {
        // 기존 캐시 삭제 (당월 재조회 대응)
        aptTradeRecordRepository.deleteByLawdCd5AndDealYmd(lawdCd5, dealYmd)

        // 공공데이터 API 조회
        val rawData = fetchAptTradeData(lawdCd5, dealYmd)
        val items = mapToAptTradeItems(rawData)

        // DB 저장
        val records = items.map { item ->
            AptTradeRecord(
                lawdCd5 = lawdCd5,
                dealYmd = dealYmd,
                aptName = item.aptName,
                dong = item.dong,
                aptDong = item.aptDong,
                jibun = item.jibun,
                floor = item.floor,
                area = item.area,
                dealAmount = item.dealAmount,
                dealDate = item.dealDate,
                buildYear = item.buildYear,
                cdealType = item.cdealType,
                cdealDay = item.cdealDay,
                dealingGbn = item.dealingGbn,
                estateAgentSggNm = item.estateAgentSggNm,
                rgstDate = item.rgstDate,
                slerGbn = item.slerGbn,
                buyerGbn = item.buyerGbn,
                landLeaseholdGbn = item.landLeaseholdGbn,
            )
        }
        aptTradeRecordRepository.saveAll(records)

        // 조회 이력 갱신
        val meta = aptTradeFetchMetaRepository.findByLawdCd5AndDealYmd(lawdCd5, dealYmd)
            ?: AptTradeFetchMeta(lawdCd5 = lawdCd5, dealYmd = dealYmd)
        meta.fetchedAt = LocalDateTime.now()
        aptTradeFetchMetaRepository.save(meta)
    }

    private fun fetchLawdCd(address: String): String {
        val response = apisisRestClient.get()
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

    private fun fetchAptTradeData(lawdCd5: String, dealYmd: String): PublicDataResponse {
        val uri = UriComponentsBuilder
            .fromUriString(publicDataConfig.baseUrl)
            .path("/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade")
            .queryParam("serviceKey", publicDataConfig.serviceKey)
            .queryParam("LAWD_CD", lawdCd5)
            .queryParam("DEAL_YMD", dealYmd)
            .queryParam("_type", "json")
            .queryParam("numOfRows", 999)
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
    private fun mapToAptTradeItems(data: PublicDataResponse): List<AptTradeItem> {
        val raw = data.response?.body?.items?.item ?: return emptyList()

        val maps: List<Map<String, Any?>> = when (raw) {
            is List<*> -> raw.filterIsInstance<Map<String, Any?>>()
            is Map<*, *> -> listOf(raw as Map<String, Any?>)
            else -> return emptyList()
        }

        return maps.map { m ->
            val month = m["dealMonth"]?.toString()?.padStart(2, '0') ?: "01"
            val day = m["dealDay"]?.toString()?.padStart(2, '0') ?: "01"
            AptTradeItem(
                aptName = m["aptNm"]?.toString() ?: "",
                dong = m["umdNm"]?.toString()?.trim() ?: "",
                aptDong = m["aptDong"]?.toString()?.trim() ?: "",
                jibun = m["jibun"]?.toString()?.trim() ?: "",
                floor = m["floor"]?.toString() ?: "",
                area = m["excluUseAr"]?.toString() ?: "",
                dealAmount = m["dealAmount"]?.toString()?.trim() ?: "",
                dealDate = "${m["dealYear"]}-$month-$day",
                buildYear = m["buildYear"]?.toString() ?: "",
                cdealType = m["cdealType"]?.toString()?.trim() ?: "",
                cdealDay = m["cdealDay"]?.toString()?.trim() ?: "",
                dealingGbn = m["dealingGbn"]?.toString()?.trim() ?: "",
                estateAgentSggNm = m["estateAgentSggNm"]?.toString()?.trim() ?: "",
                rgstDate = m["rgstDate"]?.toString()?.trim() ?: "",
                slerGbn = m["slerGbn"]?.toString()?.trim() ?: "",
                buyerGbn = m["buyerGbn"]?.toString()?.trim() ?: "",
                landLeaseholdGbn = m["landLeaseholdGbn"]?.toString()?.trim() ?: "",
            )
        }
    }
}
