import * as five from 'johnny-five';
import * as raspi from 'raspi-io';
import * as device from 'azure-iot-device';
import * as deviceAmqp from 'azure-iot-device-amqp';
import { HubClient } from "./hubClient";
import { Menu } from "./menu";
import { getRecipes } from "./recipeService";
let config = require("./config.json");
let initialState = require("./initialState.json");

let hubClient = deviceAmqp.clientFromConnectionString(process.env.DEVICE_CONN_STRING);
let deviceTwin;
let brewMessage = "ENJOY :)";
let state = initialState;

//establishing connection to gpio
let board = new five.Board({ io: new raspi() });
board.on('ready', () => {
    let menu = new Menu();

    // setup i/o
    let lcd = new five.LCD({ controller: "JHD1313M1" });
    let leftButton = new five.Button("GPIO24");
    let rightButton = new five.Button("GPIO23");
    lcd.bgColor("green");
    lcd.print("Welcome!");
    lcd.cursor(1,0);
    lcd.print("Fetching data...");

    //add menu items
    updateRecipes().then(recipes => {
        buildMenu(recipes);

        hubClient.open(err => {
            hubClient.getTwin((err, twin) => {
                deviceTwin = twin;
    
    
    
                //send heartbeat
                setTimeout(
                    () => deviceTwin.properties.reported.update({ heartbeat: new Date() }, err => {
                        if (err) console.log(`Hearbeat Error (${err})`)
                    }),
                    60000 // 1 min
                );
    
                //logic
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
                    lcd.cursor(0, 0);
                    lcd.print(request.payload.text);
                    lcd.bgColor(request.payload.color);
    
                    setTimeout(() => menu.print(lcd), 3000)
    
                    response.send(200, 'Notification received.', err => { });
                }
    
    
    
                deviceTwin.on('properties.desired', function (desiredChange) {
                    brewMessage = desiredChange.brewMessage || brewMessage;
                });
    
                //respond to C2D messages
                hubClient.on('message', msg => {
                    if (msg.type == 'recipe-update')
                        updateRecipes().then(recipes => buildMenu(recipes));
                    hubClient.complete(msg, () => { });
                });
            });
    
        })
    
        function buildMenu(recipes) {
            recipes.forEach(recipe => {
                menu.addItem(recipe.name, recipe.key, () => {
                    //calculating actuals
                    let actuals = recipe.ingredients;
                    actuals.forEach(i => {
                        Object.keys(i).forEach(k => {
                            if (k != "name")
                                i[k] = (i[k] * ((Math.random() * 0.1) + 0.95)).toFixed(2);
                        });
                    })
        
                    //check for sufficient ingredients
                    let sufficient = actuals.reduce((result, actual) => {
                        let hopperExists = state.hoppers.some(h => h.name == actual.name);
                        let hasEnough = hopperExists && state.hoppers.filter(h => h.name == actual.name)[0].currentWeight >= actual.amount;
                        return (result && hasEnough);
                    }, true);
        
                    if (!sufficient) {
                        lcd.clear();
                        lcd.cursor(0, 0);
                        lcd.bgColor("red");
                        lcd.print("Insufficient ingredients!");
                        setTimeout(() => menu.print(lcd), 3000);
                    }
                    else {
                        lcd.clear();
                        lcd.cursor(0, 0);
                        lcd.print(`Brewing ${recipe.name}`);
        
                        //print brew message
                        setTimeout(() => {
                            lcd.clear();
                            lcd.cursor(0, 0);
                            lcd.print(brewMessage);
                            setTimeout(() => menu.print(lcd), 3000);
                        }, 3000)
        
                        //reduce hopper values
                        actuals.forEach(actual => {
                            state.hoppers.filter(h => h.name == actual.name).forEach(h => {
                                h.currentWeight -= actual.amount;
                            })
                        });
        
                        //alert on low hoppers
                        state.hoppers.filter(h => h.currentWeight <= h.alertWeight).forEach(h => {
                            let message = new device.Message(JSON.stringify({ type: "hopper-alert", hopper: h.name }));
                            hubClient.sendEvent(message, (err, res) => { if (err) throw err; });
                        });
        
                        //add message type and actuals
                        let messageContent = {
                            ...{
                                type: "brew",
                                deviceId: deviceTwin.deviceId
                            },
                            ...recipe,
                            ...{ ingredients: actuals }
                        }
        
                        let message = new device.Message(JSON.stringify(messageContent));
                        hubClient.sendEvent(message, (err, res) => { if (err) throw err; });
                    }
                });
            })
            menu.print(lcd);
        }

        
    });
    
    function updateRecipes() {
        return getRecipes();
    }
    
})

