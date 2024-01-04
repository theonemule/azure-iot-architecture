module.exports = async function (context, eventHubMessage) {
  context.log(`Message: ${JSON.stringify(eventHubMessage)}`); 
  context.bindings.telemetryDocument = eventHubMessage;
  if (context.bindingData.properties.isAlarm){
    context.bindings.alarmsDocument = eventHubMessage;
  }
};
