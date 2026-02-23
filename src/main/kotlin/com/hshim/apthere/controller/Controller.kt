package com.hshim.apthere.controller

import com.hshim.apthere.model.AptPriceRequest
import com.hshim.apthere.model.AptPriceResponse
import com.hshim.apthere.model.AptTradeResponse
import com.hshim.apthere.service.AptPriceService
import com.hshim.apthere.service.AptTradeService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/apt")
class Controller(
    private val aptPriceService: AptPriceService,
    private val aptTradeService: AptTradeService,
) {
    @PostMapping("/find")
    fun find(@RequestBody request: AptPriceRequest): AptPriceResponse {
        return aptPriceService.findAptPrices(request)
    }

    @PostMapping("/trade")
    fun trade(@RequestBody request: AptPriceRequest): AptTradeResponse {
        return aptTradeService.findAptTrades(request)
    }
}
