/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const fetch = require('node-fetch');
require("dotenv").config();

const headers = {
    'Authorization': `Basic ${process.env.AUTHORIZATION_TOKEN}`,
    'accept': 'application/json'
};
const options = {
    method: 'GET',
    headers
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = "Welcome to Ray Market, your friendly grocery store in your neighbourhood."
         + '<amazon:effect name="whispered">I won\'t tell my boss we are shoping in another place.</amazon:effect>'
         + 'Anyways, What do you need today?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const TellMeASecretIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TellMeASecretIntent';   
    },
    handle(handlerInput) {
        const speakOutput = `<amazon:effect name="whispered">Today we have very good ${process.env.TEST_SECRET_WORD} at a really nice price</amazon:effect>`;
                    
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}

const AddProductToCartIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddProductToCartIntent';   
    },
    async handle(handlerInput) {
        
       const productName = handlerInput.requestEnvelope.request.intent.slots.Product.value;
       const productId = await getProductId(productName)
        
        const productSku = await getProductSku(productId);

        const cartId = await getCartId();

        const productAdded = await addProductToCart(productId, productSku, cartId);

        const speakOutput = ` ${productName} added to your cart with a price of ${productAdded.price.finalPriceFormatted}.`
                   + ` You have now ${productAdded.quantity}  ${productAdded.name} in your cart`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

async function getProductId(productName) {
    const response = await fetch(`${process.env.BACKEND_SERVER}/o/headless-commerce-delivery-catalog/v1.0/channels/${process.env.CHANNEL_ID}/products?filter=name%20eq%20%27${productName}%27`, options);
    const json = await response.json();

    return json.items[0].productId;
}

async function getProductSku(productId) {
    const response = await fetch(`${process.env.BACKEND_SERVER}/o/headless-commerce-delivery-catalog/v1.0/channels/${process.env.CHANNEL_ID}/products/${productId}/skus`, options);
    const json = await response.json();
    
    return json.items[0].id;
}

async function getCartId() {
    const response = await fetch(`${process.env.BACKEND_SERVER}/o/headless-commerce-delivery-cart/v1.0/channels/${process.env.CHANNEL_ID}/carts`, options);
    const json = await response.json();

    return json.items[0].id;

}

async function addProductToCart(productId, productSku, cartId) {
    const response = await fetch(`${process.env.BACKEND_SERVER}/o/headless-commerce-delivery-cart/v1.0/carts/${cartId}/items`,
        {
            method: 'POST', 
            headers: {
                'Authorization': `Basic ${process.env.AUTHORIZATION_TOKEN}`,
                'Accept': 'application/json', 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    "productId": productId,
                    "quantity": 1,
                    "skuId": productSku
                }    
            )
        });
    const json = await response.json();
    return json;
}


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can ask me to add the products you need to the cart. What groceries do you need today? ';

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
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
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
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AddProductToCartIntentHandler,
        TellMeASecretIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();