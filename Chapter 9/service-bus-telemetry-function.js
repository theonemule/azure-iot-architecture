module.exports = async function(context, mySbMsg) {
 context.log('Processed: ', mySbMsg);
 context.bindings.telemetryDocument = mySbMsg;
};
