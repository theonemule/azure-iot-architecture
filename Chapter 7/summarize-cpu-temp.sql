SELECT
    DATEADD(minute, DATEDIFF(minute, 0, [datetime]) / 5 * 5, 0) AS FiveMinuteInterval,
    AVG(cpuTemp) AS AverageCpuTemp
FROM
    your_table
GROUP BY
    DATEADD(minute, DATEDIFF(minute, 0, [datetime]) / 5 * 5, 0)
ORDER BY
    FiveMinuteInterval;