SELECT academic_year, fuori_sede,
  CAST(COUNT(*) AS FLOAT) / SUM(COUNT(*)) OVER () AS frequency
FROM Person
GROUP BY academic_year, fuori_sede;
