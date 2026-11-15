CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    asset_path VARCHAR(100),
    deadline_time TIME NOT NULL,
    publish_correct_answers BOOLEAN NOT NULL DEFAULT TRUE,
    publish_delay_hours INT NOT NULL DEFAULT 0,
    registration_mode VARCHAR(30) NOT NULL DEFAULT 'on_login',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;