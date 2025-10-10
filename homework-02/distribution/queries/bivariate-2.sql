SELECT academic_year, CAST(avg_score AS INTEGER) AS avg_score,
  CAST(COUNT(*) AS FLOAT) / SUM(COUNT(*)) OVER () AS frequency
FROM Person
GROUP BY academic_year, CAST(avg_score AS INTEGER);
