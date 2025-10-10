SELECT academic_year,
  CAST(COUNT(*) AS FLOAT) / SUM(COUNT(*)) OVER () AS frequency
FROM Person
GROUP BY academic_year;
