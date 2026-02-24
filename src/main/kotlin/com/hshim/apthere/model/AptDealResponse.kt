package com.hshim.apthere.model

import com.hshim.apthere.entity.AptDealRecord

data class AptDealResponse(
    val lawdCd: String,
    val aptName: String,
    val dong: String,
    val buildYear: String,
    val trade: AptDealTrade,
    val rent: AptDealRent,
)

data class AptDealTrade(
    val totalCount: Int,
    val monthlySummary: List<TradeMonthlySummary>,
    val items: List<TradeItem>,
)

data class TradeMonthlySummary(
    val yearMonth: String,
    val count: Int,
    val avgAmount: Long?,
)

data class TradeItem(
    val floor: String,
    val area: String,
    val dealAmount: Long?,
    val dealDate: String,
    val dong: String,
    val aptDong: String,
    val dealingGbn: String,
    val cdealType: String,
    val cdealDay: String,
    val estateAgentSggNm: String,
    val rgstDate: String,
    val slerGbn: String,
    val buyerGbn: String,
    val landLeaseholdGbn: String,
) {
    constructor(record: AptDealRecord): this (
        floor = record.floor,
        area = record.area,
        dealAmount = record.dealAmount,
        dealDate = record.dealDate,
        dong = record.dong,
        aptDong = record.aptDong,
        dealingGbn = record.dealingGbn,
        cdealType = record.cdealType,
        cdealDay = record.cdealDay,
        estateAgentSggNm = record.estateAgentSggNm,
        rgstDate = record.rgstDate,
        slerGbn = record.slerGbn,
        buyerGbn = record.buyerGbn,
        landLeaseholdGbn = record.landLeaseholdGbn,
    )
}

data class AptDealRent(
    val totalCount: Int,
    val jeonseCount: Int,
    val wolseCount: Int,
    val monthlySummary: List<RentMonthlySummary>,
    val items: List<RentItem>,
)

data class RentMonthlySummary(
    val yearMonth: String,
    val jeonseCount: Int,
    val jeonseAvgDeposit: Long?,
    val wolseCount: Int,
    val wolseAvgDeposit: Long?,
    val wolseAvgMonthly: Long?,
)

data class RentItem(
    val floor: String,
    val area: String,
    val rentType: String,
    val deposit: Long?,
    val monthlyRent: Long?,
    val dealDate: String,
    val contractType: String,
    val useRRRight: String,
) {
    constructor(record: AptDealRecord): this (
        floor = record.floor,
        area = record.area,
        rentType = record.dealType.name,
        deposit = record.deposit,
        monthlyRent = record.monthlyRent,
        dealDate = record.dealDate,
        contractType = record.contractType,
        useRRRight = record.useRRRight,
    )
}