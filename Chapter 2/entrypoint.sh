#!/bin/sh

cd /app

if [ -z "$START" ]
then
	START="offline"
fi

if [ -z "$TELEMETRY" ]
then
	TELEMETRY="simulator"
fi

if [ -z "$CAMERA" ]
then
	CAMERA="simulator"
fi

if [ -z "$POLLFREQ" ]
then
	POLLFREQ="5000"
fi

cat > settings.json <<EOL
{
	"start":"$START",
	"telemetry":"$TELEMETRY",
	"camera":"$CAMERA",
	"pollFreq": $POLLFREQ,
	"connString": "$CONNSTR",
	"provisioningHost":"$PROVISIONINGHOST",
	"idScope":"$IDSCOPE",
	"symmetricKey":"$SYMMETRICKEY",
	"registrationId":"$REGISTRATIONID"
}
EOL

npm start
