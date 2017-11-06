import * as five from 'johnny-five'; //TODO
import * as raspi from 'raspi-io'; //TODO

// import * as five from "./five-mock";
import * as device from 'azure-iot-device';
import * as deviceAmqp from 'azure-iot-device-amqp';

// let connectionString = process.env.DEVICE_CONN_STRING;
let connectionString = 'HostName=cfhub.azure-devices.net;DeviceId=dxpi12;SharedAccessKey=+romy/Woi3j/wP4WZ3AVWKQUtf1CTQ7Ugp89JFdzTAI=';
let hubClient = deviceAmqp.clientFromConnectionString(connectionString);
let state = {
    recipes: {
        "recipe1": {
            ingredients: {
                "water": { amount: 17, temperature: 170 },
                "chocolate": { amount: 30 },
                "verona": { amount: 30 }
            }
        },
        "recipe2": {
            ingredients: {
                "water": { amount: 17, temperature: 170 },
                "chocolate": { amount: 30 },
                "verona": { amount: 30 }
            }
        },
    },
    location: "5 NW Kitchen"
}

//establishing connection to gpio
let board = new five.Board({ io: new raspi() }); //TODO
// let board = new five.Board({});
board.on('ready', () => {
    hubClient.open(err => {
        hubClient.getTwin((twinErr, twin) => {

            // state.hoppers.verona.currentWeight = 70;

            if (twinErr) console.log(`Error getting the device twin (${twinErr})`);

            // setup i/o
            let lcd = new five.LCD({ controller: "JHD1313M1" });
            let leftButton = new five.Button("GPIO24");
            let rightButton = new five.Button("GPIO23");

            //logic
            lcd.print("PEQUOD!");
            leftButton.on('press', () => {
                lcd.print('left');
                lcd.bgColor("red");
                console.log(twin);
            })
            rightButton.on('press', () => {
                lcd.print('right');
                lcd.bgColor("green");
            })

            //update device twin property
            twin.properties.reported.update(state, err => {
                if (err) console.error('could not update twin ' + err);
                else console.log('twin state reported');
            })

            twin.on('properties.desired', function (desiredChange) {
                console.log("received change: " + JSON.stringify(desiredChange));
                lcd.bgColor("blue");
            });

            // //send iot hub message
            // let message = new device.Message(
            //     JSON.stringify({ deviceId: 'dxpi12', tags: ['foo', 'baz', 'bar'] })
            // );
            // hubClient.sendEvent(message, (err, res) => {
            //     if (err) console.log('hub error: ' + err);
            //     else console.log(res);
            // });

            // //respond to C2D messages
            // hubClient.on('message', msg => {
            //     hubClient.complete(msg, () => {});
            // });

        })
    });
});

function initialize() {
    // set state to the contents of desired properties

    // hoppers: {
    //     "verona": { currentWeight: 75, alertWeight: 25 },
    //     "pike place": { currentWeight: 50, alertWeight: 25 },
    //     "milk": { currentWeight: 98, alertWeight: 25 },
    //     "chocolate": { currentWeight: 15, alertWeight: 25 },
    //     "water": { currentWeight: 100, alertWeight: 100 }
    // },

}