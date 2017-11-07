import { Menu } from "./menu";
import { HubClient } from "./hubClient";

let hubClient = new HubClient('HostName=cfhub.azure-devices.net;DeviceId=dxpi12;SharedAccessKey=+romy/Woi3j/wP4WZ3AVWKQUtf1CTQ7Ugp89JFdzTAI=');

let menu = new Menu();
menu.addItem("Item 1","item1", () => {
    console.log("sending item1 as message")
    hubClient.sendMessage({msg:"item1"});
});

menu.addItem("Item 2","item2", () => console.log('item2'));
menu.addItem("Item 3","item3", () => console.log('item3'));
menu.print();
menu.incrementSelection();
menu.print();

