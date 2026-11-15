
CREATE TABLE answers (
    id INT AUTO_INCREMENT PRIMARY KEY,

    registration_id INT NOT NULL,
    card_id INT NOT NULL,

    answer TEXT NOT NULL,
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    admin_evaluation BOOLEAN DEFAULT NULL,

    UNIQUE KEY uq_answers_registration_card
        (registration_id, card_id),

    CONSTRAINT fk_answers_registration
        FOREIGN KEY (registration_id)
        REFERENCES registrations(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_answers_card
        FOREIGN KEY (card_id)
        REFERENCES cards(id)
        ON DELETE RESTRICT

) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
