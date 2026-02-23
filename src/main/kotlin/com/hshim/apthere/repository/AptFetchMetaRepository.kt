package com.hshim.apthere.repository

import com.hshim.apthere.entity.AptFetchMeta
import org.springframework.data.jpa.repository.JpaRepository

interface AptFetchMetaRepository : JpaRepository<AptFetchMeta, Long> {

    fun findByLawdCd5AndDealYmdIn(lawdCd5: String, dealYmds: List<String>): List<AptFetchMeta>

    fun findByLawdCd5AndDealYmd(lawdCd5: String, dealYmd: String): AptFetchMeta?
}
