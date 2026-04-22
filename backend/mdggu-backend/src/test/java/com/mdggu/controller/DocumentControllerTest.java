package com.mdggu.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mdggu.config.JwtAuthenticationFilter;
import com.mdggu.config.TokenProvider;
import com.mdggu.model.Document;
import com.mdggu.service.DocumentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DocumentController.class)
@DisplayName("DocumentController 통합 테스트")
class DocumentControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean DocumentService documentService;
    @MockBean TokenProvider tokenProvider;
    @MockBean JwtAuthenticationFilter jwtAuthenticationFilter;

    private Document sampleDocument(Long id, String username) {
        Document doc = new Document();
        doc.setId(id);
        doc.setTitle("테스트 문서");
        doc.setContent("# 테스트\n내용입니다.");
        doc.setUsername(username);
        return doc;
    }

    // ── 목록 조회 ────────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "test@example.com", authorities = "USER")
    @DisplayName("GET /documents - 내 문서 목록 반환")
    void getAllDocuments_returnsUserDocuments() throws Exception {
        given(documentService.findAllDocumentsByCurrentUser())
                .willReturn(List.of(sampleDocument(1L, "test@example.com")));

        mockMvc.perform(get("/api/v1/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("테스트 문서"));
    }

    @Test
    @DisplayName("GET /documents - 미인증 시 401")
    void getAllDocuments_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/documents"))
                .andExpect(status().isUnauthorized());
    }

    // ── 단건 조회 ────────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "test@example.com", authorities = "USER")
    @DisplayName("GET /documents/{id} - 본인 문서 조회 성공")
    void getDocumentById_owner_returnsDocument() throws Exception {
        given(documentService.findDocumentById(1L))
                .willReturn(Optional.of(sampleDocument(1L, "test@example.com")));

        mockMvc.perform(get("/api/v1/documents/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(username = "other@example.com", authorities = "USER")
    @DisplayName("GET /documents/{id} - 타인 문서 조회 시 404")
    void getDocumentById_notOwner_returns404() throws Exception {
        given(documentService.findDocumentById(1L))
                .willReturn(Optional.of(sampleDocument(1L, "test@example.com")));

        mockMvc.perform(get("/api/v1/documents/1"))
                .andExpect(status().isNotFound());
    }

    // ── 생성 ─────────────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "test@example.com", authorities = "USER")
    @DisplayName("POST /documents - 문서 생성 성공")
    void createDocument_success() throws Exception {
        Document newDoc = sampleDocument(2L, "test@example.com");
        given(documentService.saveDocument(any())).willReturn(newDoc);

        mockMvc.perform(post("/api/v1/documents")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newDoc)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2));
    }

    // ── 삭제 ─────────────────────────────────────────────────────────────────────

    @Test
    @WithMockUser(username = "test@example.com", authorities = "USER")
    @DisplayName("DELETE /documents/{id} - 본인 문서 삭제 성공")
    void deleteDocument_owner_success() throws Exception {
        given(documentService.findDocumentById(1L))
                .willReturn(Optional.of(sampleDocument(1L, "test@example.com")));
        willDoNothing().given(documentService).deleteDocument(1L);

        mockMvc.perform(delete("/api/v1/documents/1").with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "other@example.com", authorities = "USER")
    @DisplayName("DELETE /documents/{id} - 타인 문서 삭제 시 404")
    void deleteDocument_notOwner_returns404() throws Exception {
        given(documentService.findDocumentById(1L))
                .willReturn(Optional.of(sampleDocument(1L, "test@example.com")));

        mockMvc.perform(delete("/api/v1/documents/1").with(csrf()))
                .andExpect(status().isNotFound());
    }
}
