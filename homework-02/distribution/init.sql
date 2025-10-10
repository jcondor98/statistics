CREATE TABLE Person (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    fuori_sede BOOLEAN NOT NULL,
    avg_score DECIMAL(4,2) CHECK (avg_score >= 18 AND avg_score <= 30),
    academic_year INTEGER CHECK (academic_year BETWEEN 1 AND 5)
);
