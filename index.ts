import * as five from 'johnny-five';
import * as raspi from 'raspi-io';
import * as Camera from 'camerapi';
import * as cognitiveServices from 'cognitive-services'
import * as fs from 'fs';
import * as device from 'azure-iot-device';
import * as deviceAmqp from 'azure-iot-device-amqp';

// let cogClient = new oxford.Client(process.env.COGNITIVE_SERVICES_KEY);
let visionClient = new cognitiveServices();
let connectionString = process.env.DEVICE_CONN_STRING;
let hubClient = deviceAmqp.clientFromConnectionString(connectionString);

//establishing connection to gpio
let board = new five.Board({ io: new raspi() });
board.on('ready', () => {

    // setup i/o
    let led1 = new five.Led('GPIO26');
    // let led2 = new five.Led('GPIOXX');
    // let led3 = new five.Led('GPIOXX');
    let button1 = new five.Button('GPIO20');
    // let button2 = new five.Button('GPIOXX');
    // let button3 = new five.Button('GPIOXX');

    //control an led
    led1.on();
    led1.off();
    led1.blink(500); //500ms
    led1.stop();

    //button event
    button1.on('press', () => {
        //do something
    })

    //use the camera
    // let cam = new Camera();
    // cam.baseFolder('.');
    // cam.takePicture('picture.png', (file, error) => {})
    //fs.unlinkSync('picture.png'); //delete a picture
    
    //iot hub
    hubClient.open(err => {});
    let message = new device.Message(
        JSON.stringify({ deviceId: 'device1', tags: ['foo', 'baz', 'bar'] })
    );
    hubClient.sendEvent(message, (err,res) => {});
});