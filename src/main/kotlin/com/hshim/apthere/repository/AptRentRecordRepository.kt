package com.hshim.apthere.repository

import com.hshim.apthere.entity.AptRentRecord
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional

interface AptRentRecordRepository : JpaRepository<AptRentRecord, Long> {

    fun findByLawdCd5AndDealYmdInAndDong(lawdCd5: String, dealYmds: List<String>, dong: String): List<AptRentRecord>

    @Modifying
    @Transactional
    @Query("DELETE FROM AptRentRecord r WHERE r.lawdCd5 = :lawdCd5 AND r.dealYmd = :dealYmd")
    fun deleteByLawdCd5AndDealYmd(lawdCd5: String, dealYmd: String)
}
