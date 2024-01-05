CREATE VIEW telemetryVw
AS
SELECT deviceId,
DATEADD(S, CONVERT(int,LEFT(ts, 10)), '1970-01-01') as tsDate, cpuTemp,
cpuLoad
FROM OPENROWSET(PROVIDER = 'CosmosDB',
 CONNECTION = 'Account=<YOUR ACCOUNT>;Database=<YOUR DATABASE>',
 OBJECT = '<YOUR CONTAINER>',
 SERVER_CREDENTIAL = 'iottelemetry'
)
WITH (deviceId varchar(50) '$.SystemProperties.connectionDeviceId',
 ts BIGINT '$.Body.timestamp',
 cpuTemp INT '$.Body.cpuTemp',
 cpuLoad INT '$.Body.cpuLoad'
) AS [telemetry]