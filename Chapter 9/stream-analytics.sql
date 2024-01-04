SELECT timestamp, memTotal, memUsed, cpuLoad, cpuTemp, fs, network, batteryPercent, batteryCharging, EventProcessedUtcTime, EventEnqueuedUtcTime, IoTHub.IoTHub.MessageId as messageId INTO [alarms] FROM [iothub] WHERE  GetMetadataPropertyValue(iothub, '[User].[isAlarm]') = 'true';

SELECT timestamp, memTotal, memUsed, cpuLoad, cpuTemp, fs, network, batteryPercent, batteryCharging, EventProcessedUtcTime, EventEnqueuedUtcTime, IoTHub.IoTHub.MessageId as messageId INTO [telemetry] FROM [iothub]
