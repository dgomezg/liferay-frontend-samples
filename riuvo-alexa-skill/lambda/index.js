const Alexa = require('ask-sdk-core');
const fetch = require('node-fetch');
require('dotenv/config');

const BASIC_AUTH = 'dGVzdEBsaWZlcmF5LmNvbTp0ZXN0';
const headers = {'Authorization': `Basic ${BASIC_AUTH}`};
const SERVER_URL = 'http://f036173f.ngrok.io';
const CONTENT_SET_ID = 40972;
const SITE_ID = 39077;
const STRUCTURE_ID = 41043;
const USER = 'Javier Gamarra';

const options = {
    method: 'GET',
    headers
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Riuvo cars, you can ask me for available cars for rental or to buy or set up an appointment. What do you want to do?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const AvailableCarsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AvailableCarsIntent';
    },
    async handle(handlerInput) {

        const speakOutput = await listCars();

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

async function listCars() {
    const response = await fetch(`${SERVER_URL}/o/headless-delivery/v1.0/content-sets/${CONTENT_SET_ID}/content-set-elements?fields=content.title`, options);
    const json = await response.json();

    return 'You can rent one of the following cars '
        + json.items.map(courtesyCar => courtesyCar.content.title).join(', ');
}

const RoadAccidentIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RoadAccidentIntent';
    },
    async handle(handlerInput) {

        const response = await fetch(`${SERVER_URL}/o/headless-delivery/v1.0/sites/${SITE_ID}/structured-contents/`, {
                method: 'POST', headers: {...headers, 'Content-Type': 'application/json'}, body: JSON.stringify(
                {
                    "title": "New appointment",
                    "contentStructureId": STRUCTURE_ID,
                    "contentFields": [
                        {
                            "name": "User",
                            "value": {
                                "data": USER,
                            }
                        },
                        {
                            "name": "Date",
                            "value": {
                                "data": today()
                            }
                        },
                    ]
                })
            }
        );
        const json = await response.json();

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.structuredContent = json;
        sessionAttributes.replacementVehicle = true;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        const speakOutput = 'Ok! I\'ve created an appointment. Do you want a courtesy car?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const MoreInfoCarIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'MoreInfoCarIntent';
    },
    async handle(handlerInput) {

        const carName = getCarName(handlerInput);

        const response = await fetch(`${SERVER_URL}/o/headless-delivery/v1.0/sites/${SITE_ID}/structured-contents/?filter=title eq '${carName}'`, options);

        const json = await response.json();

        const speakOutput = `This car is ${getFirstFieldWithAttr(json, 'ModelSummary')}. Do you want to rent this car?`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const RentCarIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RentCarIntent';
    },
    async handle(handlerInput) {

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        const structuredContentId = sessionAttributes.structuredContent.id;

        const response = await fetch(`${SERVER_URL}/o/headless-delivery/v1.0/structured-contents/${structuredContentId}`, {
                method: 'PUT', headers: {...headers, 'Content-Type': 'application/json'}, body: JSON.stringify(
                {
                    "title": "New appointment",
                    "contentStructureId": STRUCTURE_ID,
                    "contentFields": [
                        {
                            "name": "User",
                            "value": {
                                "data": USER,
                            }
                        },
                        {
                            "name": "Date",
                            "value": {
                                "data": today()
                            }
                        },
                        {
                            "name": "Car",
                            "value": {
                                "data": getCarName(handlerInput)
                            }
                        }
                    ]
                })
            }
        );
        const json = await response.json();

        const speakOutput = 'Ok! I\'ve added the request to the appointment, see you there!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const AmazonYesIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    async handle(handlerInput) {

        let speakOutput = 'Yes!';

        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        if (sessionAttributes.replacementVehicle) {
            speakOutput = await listCars();
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can ask me for available cars for rental! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

function getCarName({requestEnvelope: {request: {intent: {slots}}}}) {
    const car = slots.car;
    const resolutions = car.resolutions;
    return resolutions.resolutionsPerAuthority[0].values[0].value.name;
}

function getFirstFieldWithAttr(json, attr) {
    const firstItem = json.items[0];
    return firstItem.contentFields.filter(x => x.name === attr).map(data => data.value.data)
}

function today() {
    return new Date().toISOString();
}

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AvailableCarsIntentHandler,
        RoadAccidentIntentHandler,
        RentCarIntentHandler,
        AmazonYesIntentHandler,
        MoreInfoCarIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();