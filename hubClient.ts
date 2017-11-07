import * as device from 'azure-iot-device';
import * as deviceAmqp from 'azure-iot-device-amqp';

export class HubClient {
    public client = deviceAmqp.clientFromConnectionString(this.connectionString);
    public twin;

    constructor(private connectionString: string) {
        // this.client = deviceAmqp.clientFromConnectionString(this.connectionString);
    }

    public open() {
        this.client.open(err => {
            if (err) throw err;
            this.twin = this.client.getTwin((err, twin) => {
                if (err) throw err;
                this.twin = twin;
            });
        });
    }

    public sendMessage(message: any) {
        let msg = new device.Message(JSON.stringify(message));
        this.client.sendEvent(msg, (err, res) => {
            if (err) throw err;
        });
    }

}