SELECT fuori_sede,
  CAST(COUNT(*) AS FLOAT) / SUM(COUNT(*)) OVER () AS frequency
FROM Person
GROUP BY fuori_sede;
