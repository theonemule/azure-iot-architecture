#!/bin/bash

for i in "$@"
do
	case $i in
		-u=*|--dpshost=*)
		DPSHOST="${i#*=}"
		;;
		-p=*|--idscope=*)
		IDSCOPE="${i#*=}"
		;;
		-l=*|--dpskey=*)
		DPSKEY="${i#*=}"
		;;
		-h=*|--deviceid=*)
		DEVICEID="${i#*=}"
		;;
		*)
		;;
	esac
done

if [ -z "$DPSHOST" ]
then
	echo "No DPS Host was set."
	exit 10
fi

if [ -z "$IDSCOPE" ]
then
	echo "No ID Scope was set."
	exit 20
fi


if [ -z "$DEVICEID" ]
then
	echo "No Device ID set."
	exit 30
fi

if [ -z "$DPSKEY" ]
then
	echo "No DPS KEy set."
	exit 40
fi

# curl -fsSL https://deb.nodesource.com/setup_lts.x | bash
# apt-get install -y deviceupdate-agent gcc g++ make nodejs git jq


git clone https://github.com/theonemule/azure-iot-architecture.git
mkdir /bin/device
cp -fR azure-iot-architecture/Chapter\ 2/* /bin/device

cd /bin/device

npm install

cat > settings.json <<EOL
{
	"start":"dps",
	"telemetry":"simulator",
	"camera":"simulator",
	"pollFreq": 5000,
	"connString": "",
	"provisioningHost":"$DPSHOST",
	"idScope":"$IDSCOPE",
	"symmetricKey":"$DPSKEY",
	"registrationId":"$DEVICEID"
}
EOL

npm install -g forever
forever start device.js

sleep 5s

CONNSTR=$(cat conn.json | jq -r '.connectionString')

cat > /etc/adu/du-config.json <<EOL
{
  "schemaVersion": "1.0",
  "aduShellTrustedUsers": [
	"root"
  ],
  "manufacturer": "IoT-Architect",
  "model": "Device-Sample",
  "agents": [
    {
      "name": "IoTAgent",
      "runas": "root",
      "connectionSource": {
        "connectionType": "string",
        "connectionData": "$CONNSTR"
      },
      "manufacturer": "IoT-Architect",
      "model": "Device-Sample"
    }
  ]
}
EOL

systemctl restart adu-agent