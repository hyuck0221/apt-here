package com.hshim.apthere.repository

import com.hshim.apthere.entity.AptTradeFetchMeta
import org.springframework.data.jpa.repository.JpaRepository

interface AptTradeFetchMetaRepository : JpaRepository<AptTradeFetchMeta, Long> {

    fun findByLawdCd5AndDealYmdIn(lawdCd5: String, dealYmds: List<String>): List<AptTradeFetchMeta>

    fun findByLawdCd5AndDealYmd(lawdCd5: String, dealYmd: String): AptTradeFetchMeta?
}
