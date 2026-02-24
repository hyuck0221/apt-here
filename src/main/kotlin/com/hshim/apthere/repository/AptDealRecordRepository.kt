package com.hshim.apthere.repository

import com.hshim.apthere.entity.AptDealRecord
import com.hshim.apthere.entity.DealType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional

interface AptDealRecordRepository : JpaRepository<AptDealRecord, Long> {

    fun findByLawdCd5AndDealYmIn(lawdCd5: String, dealYms: List<String>): List<AptDealRecord>

    fun findByLawdCd5AndDealYmInAndDong(lawdCd5: String, dealYms: List<String>, dong: String): List<AptDealRecord>

    @Modifying
    @Transactional
    @Query("DELETE FROM AptDealRecord r WHERE r.lawdCd5 = :lawdCd5 AND r.dealYm = :dealYm AND r.dealType IN :dealTypes")
    fun deleteByLawdCd5AndDealYmAndDealTypeIn(lawdCd5: String, dealYm: String, dealTypes: List<DealType>)
}
