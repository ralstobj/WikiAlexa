/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/


'use strict';
const Alexa = require('alexa-sdk');
var http = require("https");
const APP_ID = 'amzn1.ask.skill.cfa0113c-0269-4539-953d-d0678507a903';

const SKILL_NAME = 'Info Finder';
const STOP_MESSAGE = 'Goodbye!';

const HELP_MESSAGE = "This skill will get a wiki summary for you";
const HELP_REPROMPT = "say a topic";


//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetNewFactIntent');
    },
    'RalstobjIntent': function () {
        var oldThis = this;	//store this so we can reference the alexa object from inside the callback handlers
        var query = this.event.request.intent.slots.query.value;
        query = query.charAt(0).toUpperCase() + query.slice(1);
		try {
			//make call to wikipedia
			var url = 'https://en.wikipedia.org/api/rest_v1/page/summary/'+query;
			var req = http.get(url,function(res) {

				var chunks = [];
				//handle chunks of data, store
				res.on('data',function(chunk) {
					chunks.push(chunk);
				});

				//called at end, process data
				res.on('end',function() {
					var body = Buffer.concat(chunks);
					console.log("body",body.toString());
					//set default to respond with error
					var speechOutput = "error";
					try {
						var json = JSON.parse(body.toString());
						//try to extract message from json
						speechOutput = json.extract;
					} catch (e) {
						console.log("Error on parse",e,body.toString());
						speechOutput ="Error on Parse";
					}

					//speak the response
					oldThis.response.speak(speechOutput);
					oldThis.emit(':responseReady'); 
				});
				res.on('error',function() {
					oldThis.response.speak("Error getting wiki article");
					oldThis.emit(':responseReady');
				});
			});

		} catch (e) {
			//global error handler
			console.log("Error",e);
			oldThis.response.speak("error overall");
			oldThis.emit(':responseReady');

		}

    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
