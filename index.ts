import * as five from 'johnny-five';
import * as raspi from 'raspi-io';
import * as device from 'azure-iot-device';
import * as deviceAmqp from 'azure-iot-device-amqp';
import { HubClient } from "./hubClient";
import { Menu } from "./menu";
let config = require("./config.json");
let initialState = require("./initialState.json");

// let hubClient = new HubClient(config.iotHubConnectionString);
let hubClient = deviceAmqp.clientFromConnectionString(process.env.DEVICE_CONN_STRING);
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


            // setup i/o
            let lcd = new five.LCD({ controller: "JHD1313M1" });
            let leftButton = new five.Button("GPIO24");
            let rightButton = new five.Button("GPIO23");
            lcd.bgColor("green");

            //add menu items
            Object.keys(state.recipes)
                .map(k => ({ ...{ key: k }, ...state.recipes[k] }))
                .forEach(recipe => {
                    menu.addItem(recipe.name, recipe.key, () => {
                        lcd.clear();
                        lcd.cursor(0,0);
                        lcd.print(`Brewing ${recipe.name}`);
                        setTimeout(() => menu.print(lcd),3000);
                        //send brew message
                        //TODO: modify recipe ingredients (instead of hard coding)
                        let message = new device.Message(JSON.stringify({
                            recipeKey: recipe.key,
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

                        }));
                        hubClient.sendEvent(message, (err, res) => { if (err) throw err; });
                    });
                })

            //send heartbeat
            setTimeout(
                () => deviceTwin.properties.reported.update({ heartbeat: new Date() }, err => {
                    if (err) console.log(`Hearbeat Error (${err})`)
                }),
                60000 // 1 min
            );

            //logic
            lcd.print("Welcome to Pequod");
            leftButton.on('press', () => {
                menu.incrementSelection();
                menu.print(lcd);
            })

            rightButton.on('press', () => {
                menu.invokeSelectedItem();
            })

            hubClient.onDeviceMethod('notify', onNotify);

            function onNotify(request, response) {
                lcd.clear();
                lcd.cursor(0,0);
                lcd.print(request.payload.text);
                lcd.bgColor("orange");

                setTimeout(() => {
                    menu.print(lcd);
                    lcd.bgColor("green");
                },3000)
            
                response.send(200, 'Notification received.', err => {});
            }

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