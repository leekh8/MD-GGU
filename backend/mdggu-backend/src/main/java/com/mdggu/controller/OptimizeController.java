package com.mdggu.controller;

import com.mdggu.model.Document;
import com.mdggu.service.DocumentService;
import com.mdggu.service.MarkdownOptimizeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Optimize", description = "마크다운 최적화 (요약·이모지·참고링크)")
@RestController
@RequestMapping("/api/v1/optimize")
public class OptimizeController {

    @Autowired
    private MarkdownOptimizeService optimizeService;

    @Autowired
    private DocumentService documentService;

    /**
     * POST /api/v1/optimize
     * 마크다운 텍스트를 받아 최적화 결과(요약·이모지·참고링크)를 반환.
     * 문서 저장은 하지 않으므로 비로그인 사용자도 에디터에서 사용 가능.
     */
    @Operation(
            summary = "마크다운 최적화",
            description = "content 필드에 마크다운 텍스트를 전달하면 요약(summary), 이모지(emojis), 참고링크(refs)를 반환합니다."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> optimize(
            @RequestBody OptimizeRequest request) {

        if (request.content() == null || request.content().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "content는 필수입니다."));
        }

        Map<String, Object> result = optimizeService.optimize(request.content());
        return ResponseEntity.ok(new ApiResponse<>(true, "최적화 완료", result));
    }

    /**
     * POST /api/v1/optimize/{documentId}
     * 저장된 문서에 최적화 결과를 반영하여 업데이트.
     * 인증 필요 (SecurityConfig에서 /api/v1/optimize/** → authenticated()).
     */
    @Operation(
            summary = "저장된 문서 최적화 적용",
            description = "문서 ID를 지정하면 최적화 결과를 DB에 반영합니다. 본인 소유 문서만 가능."
    )
    @PostMapping("/{documentId}")
    public ResponseEntity<ApiResponse<Document>> optimizeAndSave(
            @PathVariable Long documentId) {

        return documentService.findDocumentById(documentId)
                .map(doc -> {
                    Map<String, Object> result = optimizeService.optimize(doc.getContent());

                    doc.setSummary((String) result.get("summary"));
                    doc.setEmojis((java.util.List<String>) result.get("emojis"));
                    doc.setRefs((java.util.List<String>) result.get("refs"));

                    Document saved = documentService.saveDocument(doc);
                    return ResponseEntity.ok(new ApiResponse<>(true, "문서 최적화 완료", saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    record OptimizeRequest(String content) {}
}
