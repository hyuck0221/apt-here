package com.hshim.apthere.controller

import com.hshim.apthere.model.AptDealRequest
import com.hshim.apthere.model.AptDealResponse
import com.hshim.apthere.model.AptListRequest
import com.hshim.apthere.model.AptListResponse
import com.hshim.apthere.service.AptDealService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/apt")
class Controller(
    private val aptDealService: AptDealService,
) {
    @PostMapping("/find")
    fun find(@RequestBody request: AptDealRequest): AptDealResponse {
        return aptDealService.findAptDeals(request)
    }

    @PostMapping("/list")
    fun list(@RequestBody request: AptListRequest): AptListResponse {
        return aptDealService.listApts(request)
    }
}
