export class Led {
    constructor(pin: string) { }
    on() { }
    off() { }
    blink(f: number) { }
    stop() { }
}

export class Button {
    constructor(pin: string) { }
    on(event: string, callback: any) { }
}

export class Board {
    constructor(adapter: any) { }
    on(event: string, callback: any) {
        callback();
    }
}

export class LCD {
    constructor(driver: any) { }
    print(message: string) {
        console.log(`lcd print: ${message}`);
    }
}