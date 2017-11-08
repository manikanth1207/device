import * as five from 'johnny-five';
import * as raspi from 'raspi-io';
import * as device from 'azure-iot-device';
import * as deviceAmqp from 'azure-iot-device-amqp';
import { HubClient } from "./hubClient";
import { Menu } from "./menu";
let config = require("./config.json");
let initialState = require("./initialState.json");

// let hubClient = new HubClient(config.iotHubConnectionString);
let hubClient = deviceAmqp.clientFromConnectionString(config.iotHubConnectionString);
let deviceTwin;
let state = initialState;

//establishing connection to gpio
let board = new five.Board({ io: new raspi() });
board.on('ready', () => {
    hubClient.open(err => {
        hubClient.getTwin((err, twin) => {
            deviceTwin = twin;

            // state.hoppers.verona.currentWeight = 70;

            let menu = new Menu();

            //add menu items
            Object.keys(state.recipes)
                .map(k => ({ ...{ key: k }, ...state.recipes[k] }))
                .forEach(recipe => {
                    menu.addItem(recipe.name, recipe.key, () => console.log('brew ' + recipe.key));
                })

            // setup i/o
            let lcd = new five.LCD({ controller: "JHD1313M1" });
            let leftButton = new five.Button("GPIO24");
            let rightButton = new five.Button("GPIO23");
            lcd.bgColor("green");

            //send random brew messages
            sendSampleMessage();

            function sendSampleMessage() {
                let message = {
                    recipeKey: ["hotchoc", "verona"][Math.round(Math.random())],
                    recipeVersion: "1.0.0",
                    ingredients: {
                        "water": {
                            "amount": 17 * (Math.random() * .1 + 0.95),
                            "temperature": 170 * (Math.random() * .1 + 0.95)
                        },
                        "chocolate": {
                            "amount": 30 * (Math.random() * .1 + 0.95)
                        }
                    }

                };

                let msg = new device.Message(JSON.stringify(message));
                hubClient.sendEvent(msg, (err, res) => {
                    if (err) throw err;
                });

                // hubClient.sendMessage();
                setTimeout(sendSampleMessage, Math.random() * 120000 + 60000);
            }

            //logic
            lcd.print("PEQUOD!");
            leftButton.on('press', () => {
                menu.incrementSelection();
                menu.print(lcd);
            })

            rightButton.on('press', () => {
                menu.invokeSelectedItem();
            })

            // //update device twin property
            // deviceTwin.properties.reported.update(state, err => {
            //     if (err) console.error('could not update twin ' + err);
            //     else console.log('twin state reported');
            // })

            // deviceTwin.on('properties.desired', function (desiredChange) {
            //     console.log("received change: " + JSON.stringify(desiredChange));
            //     lcd.bgColor("blue");
            // });

            // //respond to C2D messages
            // hubClient.client.on('message', msg => {
            //     hubClient.client.complete(msg, () => { });
            // });
        });

    })

})