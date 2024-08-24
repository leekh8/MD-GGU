// HealthCheckController.java
package com.mdggu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;


@RestController
public class StatusController {


    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        // 서버가 정상적으로 작동하면 "OK"를 반환
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> statusCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("server", "running");
        status.put("database", checkDatabaseConnection());
        status.put("serviceA", checkServiceAStatus());

        return ResponseEntity.ok(status);
    }

    private String checkDatabaseConnection() {
        // 데이터베이스 연결 상태를 확인하는 로직 (예: 쿼리 실행)
        return "connected";
    }

    private String checkServiceAStatus() {
        // 다른 서비스 상태 확인 로직
        return "available";
    }

}
