package com.mdggu.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * 마크다운 최적화 서비스
 * - 추출적 요약 (TF 기반 문장 점수)
 * - 키워드 기반 이모지 추천
 * - 마크다운 내 URL 참고링크 추출
 */
@Service
public class MarkdownOptimizeService {

    // 마크다운 문법 제거 패턴
    private static final Pattern MD_SYNTAX = Pattern.compile(
            "(#{1,6}\\s)|([*_]{1,3})|(`{1,3}[^`]*`{1,3})|(\\[.*?]\\(.*?\\))|(^>\\s)", Pattern.MULTILINE);

    // URL 추출 패턴
    private static final Pattern URL_PATTERN = Pattern.compile(
            "\\[([^]]+)]\\((https?://[^)]+)\\)");

    // 키워드 → 이모지 매핑
    private static final Map<String, String> EMOJI_MAP = new LinkedHashMap<>() {{
        put("오류|에러|버그|error|bug|exception", "🐛");
        put("보안|인증|암호|security|auth|password", "🔐");
        put("배포|빌드|ci|cd|deploy|build", "🚀");
        put("데이터베이스|db|sql|database", "🗄️");
        put("api|rest|graphql|endpoint", "🔌");
        put("성능|최적화|performance|optimize", "⚡");
        put("테스트|test|검증", "🧪");
        put("문서|docs|readme|document", "📄");
        put("설정|config|환경|environment", "⚙️");
        put("로그|log|모니터링|monitoring", "📊");
        put("파일|file|업로드|upload", "📁");
        put("사용자|user|계정|account", "👤");
        put("마크다운|markdown", "📝");
        put("완료|done|success|성공", "✅");
        put("경고|warning|주의", "⚠️");
    }};

    // ── 공개 API ──────────────────────────────────────────────────────────────

    /**
     * 마크다운 전체 최적화 수행
     * @return map(summary, emojis, refs)
     */
    public Map<String, Object> optimize(String markdownContent) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("summary", summarize(markdownContent, 3));
        result.put("emojis", suggestEmojis(markdownContent));
        result.put("refs", extractRefs(markdownContent));
        return result;
    }

    // ── 요약 (추출적) ──────────────────────────────────────────────────────────

    /**
     * TF 기반 추출적 요약: 핵심 단어 빈도가 높은 문장 상위 N개 반환
     */
    public String summarize(String markdown, int topN) {
        String plain = stripMarkdown(markdown);
        String[] sentences = plain.split("(?<=[.!?。])\\s+");

        if (sentences.length <= topN) {
            return plain.trim();
        }

        // 단어 빈도 계산 (불용어 제외)
        Map<String, Integer> termFreq = computeTermFrequency(plain);

        // 문장 점수 = 포함된 단어 TF 합산
        record SentenceScore(int idx, String sentence, double score) {}
        List<SentenceScore> scored = new ArrayList<>();
        for (int i = 0; i < sentences.length; i++) {
            double score = Arrays.stream(tokenize(sentences[i]))
                    .mapToInt(w -> termFreq.getOrDefault(w, 0))
                    .sum();
            scored.add(new SentenceScore(i, sentences[i], score));
        }

        // 상위 N개를 원문 순서 유지하여 반환
        return scored.stream()
                .sorted(Comparator.comparingDouble(SentenceScore::score).reversed())
                .limit(topN)
                .sorted(Comparator.comparingInt(SentenceScore::idx))
                .map(SentenceScore::sentence)
                .collect(Collectors.joining(" "));
    }

    // ── 이모지 추천 ────────────────────────────────────────────────────────────

    /**
     * 내용 키워드 분석 → 관련 이모지 최대 5개 반환
     */
    public List<String> suggestEmojis(String markdown) {
        String lower = markdown.toLowerCase();
        List<String> result = new ArrayList<>();

        for (Map.Entry<String, String> entry : EMOJI_MAP.entrySet()) {
            Pattern p = Pattern.compile(entry.getKey());
            if (p.matcher(lower).find()) {
                result.add(entry.getValue());
            }
            if (result.size() >= 5) break;
        }

        return result.isEmpty() ? List.of("📝") : result;
    }

    // ── 참고링크 추출 ──────────────────────────────────────────────────────────

    /**
     * 마크다운 링크 문법 [텍스트](URL) 에서 URL 추출 → footnote 형식으로 반환
     */
    public List<String> extractRefs(String markdown) {
        Matcher m = URL_PATTERN.matcher(markdown);
        List<String> refs = new ArrayList<>();
        int idx = 1;
        while (m.find()) {
            refs.add(String.format("[%d] %s - %s", idx++, m.group(1), m.group(2)));
        }
        return refs;
    }

    // ── 내부 유틸 ─────────────────────────────────────────────────────────────

    private String stripMarkdown(String markdown) {
        return MD_SYNTAX.matcher(markdown).replaceAll("").trim();
    }

    private String[] tokenize(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-z0-9가-힣\\s]", "")
                .split("\\s+");
    }

    private static final Set<String> STOPWORDS = Set.of(
            "the", "a", "an", "is", "are", "was", "were", "and", "or", "but",
            "in", "on", "at", "to", "for", "of", "with", "this", "that",
            "이", "그", "저", "을", "를", "이", "가", "은", "는", "에", "의", "와", "과"
    );

    private Map<String, Integer> computeTermFrequency(String text) {
        Map<String, Integer> freq = new HashMap<>();
        for (String word : tokenize(text)) {
            if (word.length() > 1 && !STOPWORDS.contains(word)) {
                freq.merge(word, 1, Integer::sum);
            }
        }
        return freq;
    }
}
