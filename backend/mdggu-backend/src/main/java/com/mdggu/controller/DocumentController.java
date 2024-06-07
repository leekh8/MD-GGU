// 문서 관련 API 엔드포인트
package com.mdggu.controller;

import com.mdggu.model.Document;
import com.mdggu.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/document")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @GetMapping
    public List<Document> getAllDocuments() {
        // 현재 사용자와 관련된 모든 문서를 반환
        return documentService.findAllDocumentsByCurrentUser();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        // 특정 문서 ID에 해당하는 문서를 반환
        return documentService.findDocumentById(id)
                .filter(document -> document.getUsername().equals(getUsernameFromSecurityContext()))
                .map(document -> ResponseEntity.ok(document))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Document createDocument(@RequestBody Document document) {
        // 새로운 문서 생성
        return documentService.saveDocument(document);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(@PathVariable Long id, @RequestBody Document updatedDocument) {
        // 특정 문서 ID에 해당하는 문서 업데이트
        return documentService.findDocumentById(id)
                .filter(document -> document.getUsername().equals(getUsernameFromSecurityContext()))
                .map(document -> {
                    document.setTitle(updatedDocument.getTitle());
                    document.setContent(updatedDocument.getContent());
                    Document savedDocument = documentService.saveDocument(document);
                    return ResponseEntity.ok(savedDocument);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteDocument(@PathVariable Long id) {
        return documentService.findDocumentById(id)
                .filter(document -> document.getUsername().equals(getUsernameFromSecurityContext()))
                .map(document -> {
                    documentService.deleteDocument(id);
                    return ResponseEntity.<Void>ok().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private String getUsernameFromSecurityContext() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else {
            return principal.toString();
        }
    }
}