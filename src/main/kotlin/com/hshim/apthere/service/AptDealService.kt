package com.hshim.apthere.service

import com.hshim.apthere.config.KakaoConfig
import com.hshim.apthere.config.PublicDataConfig
import com.hshim.apthere.entity.ApiType
import com.hshim.apthere.entity.AptDealRecord
import com.hshim.apthere.entity.AptFetchLog
import com.hshim.apthere.entity.DealType
import com.hshim.apthere.model.*
import com.hshim.apthere.repository.AptDealRecordRepository
import com.hshim.apthere.repository.AptFetchLogRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.runBlocking
import org.springframework.core.ParameterizedTypeReference
import org.springframework.stereotype.Service
import org.springframework.web.client.RestClient
import org.springframework.web.util.UriComponentsBuilder
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class AptDealService(
    private val apisIsRestClient: RestClient,
    private val publicDataConfig: PublicDataConfig,
    private val kakaoConfig: KakaoConfig,
    private val aptDealRecordRepository: AptDealRecordRepository,
    private val aptFetchLogRepository: AptFetchLogRepository,
) {
    private val publicDataRestClient = RestClient.create()
    private val kakaoRestClient = RestClient.builder()
        .baseUrl("https://dapi.kakao.com")
        .build()
    private val ymFormatter = DateTimeFormatter.ofPattern("yyyyMM")

    fun findAptDeals(request: AptDealRequest): AptDealResponse {
        val city = request.address?.split(" ")?.firstOrNull() ?: ""
        val lawdCd = request.lawdCd ?: fetchLawdCd(city, request.dong)
        val lawdCd5 = lawdCd.take(5)

        val months = last12Months()
        val currentYm = LocalDate.now().format(ymFormatter)
        val today = LocalDate.now()

        val fetchedLogs = aptFetchLogRepository.findByLawdCd5AndDealYmIn(lawdCd5, months)
            .associateBy { it.dealYm to it.apiType }

        fun needsFetch(ym: String, apiType: ApiType): Boolean {
            val log = fetchedLogs[ym to apiType]
            return when {
                log == null -> true
                ym == currentYm && log.fetchedAt.toLocalDate() < today -> true
                else -> false
            }
        }

        val missingTradeMonths = months.filter { needsFetch(it, ApiType.TRADE) }
        val missingRentMonths = months.filter { needsFetch(it, ApiType.RENT) }

        if (missingTradeMonths.isNotEmpty() || missingRentMonths.isNotEmpty()) {
            runBlocking {
                val tradeJob = async(Dispatchers.IO) {
                    missingTradeMonths.map { ym ->
                        async(Dispatchers.IO) { fetchAndSaveTrade(lawdCd5, ym) }
                    }.awaitAll()
                }
                val rentJob = async(Dispatchers.IO) {
                    missingRentMonths.map { ym ->
                        async(Dispatchers.IO) { fetchAndSaveRent(lawdCd5, ym) }
                    }.awaitAll()
                }
                tradeJob.await()
                rentJob.await()
            }
        }

        val allRecords = if (request.dong.isBlank()) {
            aptDealRecordRepository.findByLawdCd5AndDealYmIn(lawdCd5, months)
        } else {
            aptDealRecordRepository.findByLawdCd5AndDealYmInAndDong(lawdCd5, months, request.dong)
        }

        val filtered = if (request.aptName.isNullOrBlank()) allRecords
        else allRecords.filter { it.aptName.trim().contains(request.aptName.trim().replace("아파트", "")) }

        val aptName = request.aptName?.trim()
            ?: filtered.firstOrNull()?.aptName ?: ""
        val dong = filtered.firstOrNull()?.dong ?: request.dong
        val buildYear = filtered.firstOrNull()?.buildYear ?: ""

        val tradeRecords = filtered.filter { it.dealType == DealType.TRADE }
        val jeonseRecords = filtered.filter { it.dealType == DealType.JEONSE }
        val wolseRecords = filtered.filter { it.dealType == DealType.WOLSE }

        val tradeByMonth = tradeRecords.groupBy { it.dealYm }
        val tradeMonthlySummary = months.map { ym ->
            val m = tradeByMonth[ym] ?: emptyList()
            TradeMonthlySummary(
                yearMonth = ym,
                count = m.size,
                avgAmount = m.mapNotNull { it.dealAmount }.filter { it > 0 }.let {
                    if (it.isEmpty()) null else it.average().toLong()
                },
            )
        }

        val jeonseByMonth = jeonseRecords.groupBy { it.dealYm }
        val wolseByMonth = wolseRecords.groupBy { it.dealYm }
        val rentMonthlySummary = months.map { ym ->
            val j = jeonseByMonth[ym] ?: emptyList()
            val w = wolseByMonth[ym] ?: emptyList()
            RentMonthlySummary(
                yearMonth = ym,
                jeonseCount = j.size,
                jeonseAvgDeposit = j.mapNotNull { it.deposit }.filter { it > 0 }.let {
                    if (it.isEmpty()) null else it.average().toLong()
                },
                wolseCount = w.size,
                wolseAvgDeposit = w.mapNotNull { it.deposit }.filter { it > 0 }.let {
                    if (it.isEmpty()) null else it.average().toLong()
                },
                wolseAvgMonthly = w.mapNotNull { it.monthlyRent }.filter { it > 0 }.let {
                    if (it.isEmpty()) null else it.average().toLong()
                },
            )
        }

        val tradeItems = tradeRecords.sortedByDescending { it.dealDate }.map { TradeItem(it) }
        val rentItems = (jeonseRecords + wolseRecords).sortedByDescending { it.dealDate }.map { RentItem(it) }

        return AptDealResponse(
            lawdCd = lawdCd,
            aptName = aptName,
            dong = dong,
            buildYear = buildYear,
            trade = AptDealTrade(
                totalCount = tradeRecords.size,
                monthlySummary = tradeMonthlySummary,
                items = tradeItems,
            ),
            rent = AptDealRent(
                totalCount = jeonseRecords.size + wolseRecords.size,
                jeonseCount = jeonseRecords.size,
                wolseCount = wolseRecords.size,
                monthlySummary = rentMonthlySummary,
                items = rentItems,
            ),
        )
    }

    fun listApts(request: AptListRequest): AptListResponse {
        val response = try {
            kakaoRestClient.get()
                .uri { builder ->
                    builder
                        .path("/v2/local/search/keyword")
                        .queryParam("query", "아파트")
                        .queryParam("x", request.lng.toString())
                        .queryParam("y", request.lat.toString())
                        .queryParam("radius", request.radius)
                        .build()
                }
                .header("Authorization", "KakaoAK ${kakaoConfig.apiKey}")
                .retrieve()
                .body(NaverPlaceResponse::class.java)
        } catch (e: Exception) {
            null
        }

        val apartments = response
            ?.documents
            ?.filter { it.categoryName.contains("아파트") }
            ?.let { docs ->
                runBlocking {
                    docs.map { doc ->
                        async(Dispatchers.IO) {
                            val address = doc.addressName.ifBlank { doc.roadAddressName }
                            val city = address.split(" ").firstOrNull() ?: ""
                            val dong = extractDong(doc.addressName)
                            AptInfo(
                                aptName = doc.placeName,
                                dong = dong,
                                lat = doc.y.toDoubleOrNull() ?: 0.0,
                                lng = doc.x.toDoubleOrNull() ?: 0.0,
                                address = address,
                                lawdCd = try {
                                    fetchLawdCd(city, dong)
                                } catch (e: Exception) {
                                    null
                                }
                            )
                        }
                    }.awaitAll()
                }
            } ?: emptyList()

        return AptListResponse(apartments = apartments)
    }

    private fun extractDong(address: String): String =
        address.split(" ").firstOrNull {
            it.endsWith("동") || it.endsWith("리") || it.endsWith("읍")
        } ?: ""

    private fun last12Months(): List<String> =
        (11 downTo 0).map { offset ->
            LocalDate.now().minusMonths(offset.toLong()).format(ymFormatter)
        }

    private fun fetchAndSaveTrade(lawdCd5: String, dealYm: String) {
        aptDealRecordRepository.deleteByLawdCd5AndDealYmAndDealTypeIn(lawdCd5, dealYm, listOf(DealType.TRADE))
        val rawData = fetchTradeData(lawdCd5, dealYm)
        val records = extractItemMaps(rawData).map { m ->
            val month = m["dealMonth"]?.toString()?.padStart(2, '0') ?: "01"
            val day = m["dealDay"]?.toString()?.padStart(2, '0') ?: "01"
            AptDealRecord(
                lawdCd5 = lawdCd5,
                dealYm = dealYm,
                dealType = DealType.TRADE,
                aptName = m["aptNm"]?.toString() ?: "",
                dong = m["umdNm"]?.toString()?.trim() ?: "",
                aptDong = m["aptDong"]?.toString()?.trim() ?: "",
                jibun = m["jibun"]?.toString()?.trim() ?: "",
                floor = m["floor"]?.toString() ?: "",
                area = m["excluUseAr"]?.toString() ?: "",
                dealAmount = m["dealAmount"]?.toString()?.replace(",", "")?.trim()?.toLongOrNull(),
                dealingGbn = m["dealingGbn"]?.toString()?.trim() ?: "",
                estateAgentSggNm = m["estateAgentSggNm"]?.toString()?.trim() ?: "",
                rgstDate = m["rgstDate"]?.toString()?.trim() ?: "",
                slerGbn = m["slerGbn"]?.toString()?.trim() ?: "",
                buyerGbn = m["buyerGbn"]?.toString()?.trim() ?: "",
                landLeaseholdGbn = m["landLeaseholdGbn"]?.toString()?.trim() ?: "",
                cdealType = m["cdealType"]?.toString()?.trim() ?: "",
                cdealDay = m["cdealDay"]?.toString()?.trim() ?: "",
                dealDate = "${m["dealYear"]}-$month-$day",
                buildYear = m["buildYear"]?.toString() ?: "",
            )
        }
        aptDealRecordRepository.saveAll(records)
        saveOrUpdateFetchLog(lawdCd5, dealYm, ApiType.TRADE)
    }

    private fun fetchAndSaveRent(lawdCd5: String, dealYm: String) {
        aptDealRecordRepository.deleteByLawdCd5AndDealYmAndDealTypeIn(
            lawdCd5, dealYm, listOf(DealType.JEONSE, DealType.WOLSE)
        )
        val rawData = fetchRentData(lawdCd5, dealYm)
        val records = extractItemMaps(rawData).map { m ->
            val month = m["dealMonth"]?.toString()?.padStart(2, '0') ?: "01"
            val day = m["dealDay"]?.toString()?.padStart(2, '0') ?: "01"
            val monthlyRentVal = m["monthlyRent"]?.toString()?.replace(",", "")?.trim()?.toLongOrNull() ?: 0L
            val dealType = if (monthlyRentVal == 0L) DealType.JEONSE else DealType.WOLSE
            AptDealRecord(
                lawdCd5 = lawdCd5,
                dealYm = dealYm,
                dealType = dealType,
                aptName = m["aptNm"]?.toString() ?: "",
                dong = m["umdNm"]?.toString()?.trim() ?: "",
                floor = m["floor"]?.toString() ?: "",
                area = m["excluUseAr"]?.toString() ?: "",
                deposit = m["deposit"]?.toString()?.replace(",", "")?.trim()?.toLongOrNull(),
                monthlyRent = if (monthlyRentVal == 0L) null else monthlyRentVal,
                contractType = m["contractType"]?.toString()?.trim() ?: "",
                useRRRight = m["useRRRight"]?.toString()?.trim() ?: "",
                dealDate = "${m["dealYear"]}-$month-$day",
                buildYear = m["buildYear"]?.toString() ?: "",
            )
        }
        aptDealRecordRepository.saveAll(records)
        saveOrUpdateFetchLog(lawdCd5, dealYm, ApiType.RENT)
    }

    private fun saveOrUpdateFetchLog(lawdCd5: String, dealYm: String, apiType: ApiType) {
        aptFetchLogRepository.deleteByLawdCd5AndDealYmAndApiType(lawdCd5, dealYm, apiType)
        aptFetchLogRepository.save(AptFetchLog(lawdCd5 = lawdCd5, dealYm = dealYm, apiType = apiType))
    }

    private fun fetchLawdCd(city: String, dong: String): String {
        val response = apisIsRestClient.get()
            .uri { builder ->
                builder.path("/area-codes")
                    .queryParam("city", city)
                    .queryParam("village", dong)
                    .queryParam("page", 0)
                    .queryParam("size", 1)
                    .build()
            }
            .retrieve()
            .body(object : ParameterizedTypeReference<APIsisEnvelope<AreaCodePagePayload>>() {})
        return response?.payload?.content?.firstOrNull()?.code
            ?: throw IllegalArgumentException("해당 지역($city $dong)에 해당하는 법정동코드를 찾을 수 없습니다.")
    }

    private fun fetchTradeData(lawdCd5: String, dealYm: String): PublicDataResponse {
        val uri = UriComponentsBuilder
            .fromUriString(publicDataConfig.baseUrl)
            .path("/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade")
            .queryParam("serviceKey", publicDataConfig.serviceKey)
            .queryParam("LAWD_CD", lawdCd5)
            .queryParam("DEAL_YMD", dealYm)
            .queryParam("_type", "json")
            .queryParam("numOfRows", 999)
            .queryParam("pageNo", 1)
            .build()
            .toUri()
        return publicDataRestClient.get().uri(uri).retrieve()
            .body(PublicDataResponse::class.java) ?: PublicDataResponse()
    }

    private fun fetchRentData(lawdCd5: String, dealYm: String): PublicDataResponse {
        val uri = UriComponentsBuilder
            .fromUriString(publicDataConfig.baseUrl)
            .path("/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent")
            .queryParam("serviceKey", publicDataConfig.serviceKey)
            .queryParam("LAWD_CD", lawdCd5)
            .queryParam("DEAL_YMD", dealYm)
            .queryParam("_type", "json")
            .queryParam("numOfRows", 999)
            .queryParam("pageNo", 1)
            .build()
            .toUri()
        return publicDataRestClient.get().uri(uri).retrieve()
            .body(PublicDataResponse::class.java) ?: PublicDataResponse()
    }

    @Suppress("UNCHECKED_CAST")
    private fun extractItemMaps(data: PublicDataResponse): List<Map<String, Any?>> {
        val raw = data.response?.body?.items?.item ?: return emptyList()
        return when (raw) {
            is List<*> -> raw.filterIsInstance<Map<String, Any?>>()
            is Map<*, *> -> listOf(raw as Map<String, Any?>)
            else -> emptyList()
        }
    }
}
