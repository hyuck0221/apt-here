package com.hshim.apthere.repository

import com.hshim.apthere.entity.ApiType
import com.hshim.apthere.entity.AptFetchLog
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.transaction.annotation.Transactional

interface AptFetchLogRepository : JpaRepository<AptFetchLog, Long> {

    fun findByLawdCd5AndDealYmIn(lawdCd5: String, dealYms: List<String>): List<AptFetchLog>

    fun findByLawdCd5AndDealYmAndApiType(lawdCd5: String, dealYm: String, apiType: ApiType): AptFetchLog?

    @Transactional
    fun deleteByLawdCd5AndDealYmAndApiType(lawdCd5: String, dealYm: String, apiType: ApiType)
}
