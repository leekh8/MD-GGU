// Document 엔티티에 대한 데이터 액세스
package com.mdggu.repository;

import com.mdggu.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findAllByUsername(String username);
}