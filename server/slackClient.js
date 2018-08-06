const { RTMClient,LogLevel } = require('@slack/client');

let rtm = null;
let nlp = null;
let registry = null;

// An access token (from your Slack app or custom integration - usually xoxb)

function handleOnAuthenticated(rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}.`);
}

function addAuthenticatedHandler(rtm, handler) {
    rtm.on('authenticated', handler);
}

const handleOnMessage = (rtm) => {
    rtm.on('message', (message) => {
        // For structure of `event`, see https://api.slack.com/events/message

        // Skip messages that are from a bot or my own user ID
        if ( (message.subtype && message.subtype === 'bot_message') ||
            (!message.subtype && message.user === rtm.activeUserId) ) {
            return;
        }

        // Log the message
        console.log(`(channel:${message.channel}) ${message.user} says: ${message.text}`);

        if (message.text.toLocaleLowerCase().includes('iris')) {


            nlp.ask(message.text, (err, res) => {
                if(err) {
                    console.log(err);
                    return;
                }

                try {
                    if (!res.intent || !res.intent[0] || !res.intent[0].value) {
                        throw new Error("Could not extract intent.");
                    }

                    const intent = require('./intents/' + res.intent[0].value + 'Intent');

                    intent.process(res, registry, function(error, response) {
                        if(error) {
                            console.log(error.message);
                            return rtm.sendMessage("Sorry, I don't know what you are talking about", message.channel);
                        }

                        return rtm.sendMessage(response, message.channel);
                    });

                } catch (err) {
                    console.log(err);
                    console.log(res);
                    return rtm.sendMessage("Sorry, I don't know what you are talking about", message.channel);
                }
            });
        }
    });
};

module.exports.init = function slackClient(token, nlpClient, serviceRegistry) {
    const rtm = new RTMClient(token, {logLevel: LogLevel.INFO});
    nlp = nlpClient;
    registry = serviceRegistry;
    addAuthenticatedHandler(rtm, handleOnAuthenticated);
    return rtm;
};

module.exports.addAuthenticatedHandler = addAuthenticatedHandler;
module.exports.handleOnMessage = handleOnMessage;

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
// const conversationId = 'C1232456';

// // The RTM client can send simple string messages
// rtm.sendMessage('Hello there', conversationId)
//     .then((res) => {
//         // `res` contains information about the posted message
//         console.log('Message sent: ', res.ts);
//     })
//     .catch(console.error);