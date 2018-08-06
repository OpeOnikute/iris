'use strict';

const slackClient = require('../server/slackClient');
const service = require('../server/service');
const http = require('http');

const witToken = 'QOMPD7QR3QTELO3FHLWORDX6OQK77762';
const witClient = require('../server/witClient')(witToken);

const token = "xoxb-73514733526-405843886577-rQXZOtqD81KtELIbDGp9clcn";

const serviceRegistry = service.get('serviceRegistry');
const rtm = slackClient.init(token, witClient, serviceRegistry);
rtm.start();

slackClient.addAuthenticatedHandler(rtm, () => server.listen(3000));
slackClient.handleOnMessage(rtm);

const server = http.createServer(service);
server.listen(3000);

server.on('listening', function () {
    console.log(`IRIS is listening on ${server.address().port} in ${service.get('env')} mode.`);
});
