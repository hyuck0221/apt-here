package com.hshim.apthere.repository

import com.hshim.apthere.entity.AptTradeRecord
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional

interface AptTradeRecordRepository : JpaRepository<AptTradeRecord, Long> {

    fun findByLawdCd5AndDealYmdIn(lawdCd5: String, dealYmds: List<String>): List<AptTradeRecord>

    fun findByLawdCd5AndDealYmdInAndDong(lawdCd5: String, dealYmds: List<String>, dong: String): List<AptTradeRecord>

    @Modifying
    @Transactional
    @Query("DELETE FROM AptTradeRecord r WHERE r.lawdCd5 = :lawdCd5 AND r.dealYmd = :dealYmd")
    fun deleteByLawdCd5AndDealYmd(lawdCd5: String, dealYmd: String)
}
