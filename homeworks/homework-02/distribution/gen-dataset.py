#!/usr/bin/env python3
from faker import Faker
import random

faker = Faker()

DEFAULT_POPULATION_UNIT_COUNT=100

def gen_person_row():
    name = faker.first_name().replace("'", "''")
    surname = faker.last_name().replace("'", "''")
    fuori_sede = random.randint(0, 1)
    avg_score = round(random.uniform(18, 30), 1)
    academic_year = random.randint(1, 5)
    return f"('{name}', '{surname}', {fuori_sede}, {avg_score}, {academic_year})"

def gen_insert_query(n=DEFAULT_POPULATION_UNIT_COUNT):
    rows = ",\n  ".join(gen_person_row() for _ in range(n))
    return f"INSERT INTO Person (name, surname, fuori_sede, avg_score, academic_year)\nVALUES\n  {rows};"

if __name__ == "__main__":
    print(gen_insert_query(100)) # TODO: Parse count from arguments
