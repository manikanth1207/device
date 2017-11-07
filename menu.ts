import * as _ from "lodash";

export class Menu {
    private items: MenuItem[] = [];

    addItem(displayName: string, key: string, invoke: () => void, parentKey?: string) {
        let item = new MenuItem();
        item.displayName = displayName;
        item.key = key;
        item.invoke = invoke;
        if (this.items.length == 0) item.selected = true;
        this.items.push(item);
    }

    incrementSelection() {
        let selectedItem = _.find(this.items, i => i.selected);
        let selectedItemIndex = this.items.indexOf(selectedItem);
        let isLast = selectedItem == this.items[this.items.length - 1];

        // increment selected item
        if (!isLast)
            this.items.forEach((item, i) => item.selected = (i == (selectedItemIndex + 1)));
    }

    decrementSelection() {
        let selectedItem = _.find(this.items, i => i.selected);
        let selectedItemIndex = this.items.indexOf(selectedItem);

        // decrement selected item
        this.items.forEach((item, i) => item.selected = (i == (Math.max(0, selectedItemIndex - 1))));
    }

    invokeSelectedItem() {
        let item: MenuItem = _.find(this.items, i => i.selected);
        item.invoke();
    }

    print() {
        this.items.forEach(item => {
            console.log(`${(item.selected ? "> " : "")}${item.displayName}`);
        })
    }
}

class MenuItem {
    public key: string;
    public displayName: string;
    public selected: boolean = false;
    public invoke: () => void;
}