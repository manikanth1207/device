import * as five from 'johnny-five';
import * as raspi from 'raspi-io';
import { HubClient } from "./hubClient";
let config = require("./config.json");
let initialState = require("./initialState.json");

let hubClient = new HubClient(config.iotHubConnectionString);
let state = initialState;

//establishing connection to gpio
let board = new five.Board({ io: new raspi() });
board.on('ready', () => {
    // state.hoppers.verona.currentWeight = 70;

    // setup i/o
    let lcd = new five.LCD({ controller: "JHD1313M1" });
    let leftButton = new five.Button("GPIO24");
    let rightButton = new five.Button("GPIO23");

    //logic
    lcd.print("PEQUOD!");
    leftButton.on('press', () => {
        lcd.print('left');
        lcd.bgColor("red");
        console.log(hubClient.twin);
    })
    rightButton.on('press', () => {
        lcd.print('right');
        lcd.bgColor("green");
    })

    //update device twin property
    hubClient.twin.properties.reported.update(state, err => {
        if (err) console.error('could not update twin ' + err);
        else console.log('twin state reported');
    })
    hubClient.twin.on('properties.desired', function (desiredChange) {
        console.log("received change: " + JSON.stringify(desiredChange));
        lcd.bgColor("blue");
    });

    //respond to C2D messages
    hubClient.client.on('message', msg => {
        hubClient.client.complete(msg, () => {});
    });

})