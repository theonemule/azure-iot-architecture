!#/bin/bash
cp ./simulator-settings.json /bin/device/Simulator/simulator-settings.json
pkill node
forever start /bin/device/device.js