// User 엔티티에 대한 데이터 액세스
package com.mdggu.repository;

import com.mdggu.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);

    User findByUsername(String username);
}
