// 문서 관련 비즈니스 로직
package com.mdggu.service;

import com.mdggu.model.Document;
import com.mdggu.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {
    @Autowired
    private DocumentRepository documentRepository;

    public List<Document> findAllDocuments() {
        return documentRepository.findAll();
    }

    public List<Document> findAllDocumentsByCurrentUser() {
        String username = getUsernameFromSecurityContext();
        return documentRepository.findAllByUsername(username);
    }


    public Optional<Document> findDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    public Document saveDocument(Document document) {
        document.setUsername(getUsernameFromSecurityContext());
        return documentRepository.save(document);
    }

    public void deleteDocument(Long id) {
        documentRepository.deleteById(id);
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
