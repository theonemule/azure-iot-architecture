module.exports = async function(context, mySbMsg) {
  context.log('Processed: ', mySbMsg);
  context.bindings.alarmsDocument = mySbMsg;
};
