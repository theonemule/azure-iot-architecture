module.exports = async function (context, req, connectionInfo) {
	context.log(`conecting: ${JSON.stringify(connectionInfo)}`)
    context.res.body = connectionInfo;
	context.done();
};