SELECT CAST(avg_score AS INTEGER) AS avg_score,
  CAST(COUNT(*) AS FLOAT) / SUM(COUNT(*)) OVER () AS frequency
FROM Person
GROUP BY CAST(avg_score AS INTEGER);
