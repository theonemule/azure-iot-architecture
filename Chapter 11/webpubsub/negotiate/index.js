module.exports = function (context, req, connection) {
	context.log(`conecting: ${JSON.stringify(connection)}`)
    context.res = { body: connection };
    context.done();
};