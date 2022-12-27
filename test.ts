import { EASUN, SerialPortOptions } from "./easun";
import config from "./config.json";

interface OrigAddressConfig {
    no?: number,
    ctl: string,
    visible?: number, // 0 | 1
    ename: string,
    address: number,
    len: number,
    maxLen?: number,
    rate: number,
    format: string, // util.format()
    unit: string,
    signed?: "S",
    sel?: { item: Array<{ no: number, ename: string | number }> }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function test(): Promise<void> {
    const easun = new EASUN("/dev/ttyUSB0");
    await easun.connect();

    // const info = {
    //     "ctl": "lblNameTotal2",
    //     "visible": 1,
    //     "name": "Load consum energy total",
    //     "address": 61498,
    //     "len": 2,
    //     "rate": 0.1,
    //     "format": "%.1f",
    //     "unit": "kWh"
    // };

    // const info = {
    //     "ctl": "lblNameLineV",
    //     "visible": 1,
    //     "name": "Line voltage",
    //     "address": 531,
    //     "len": 1,
    //     "rate": 0.1,
    //     "format": "%.1f",
    //     "unit": "V"
    // };

    const info = {
        "ctl": "cmbStatistic",
        "name": "Battery charge energy",
        "address": 61447,
        "len": 7,
        "rate": 1,
        "format": "%d",
        "unit": "Ah"
    };

    const num = await easun.readNumber(info);
    console.log(info.name + "(" + info.unit + "): " + num);

    process.exit();
}

async function info() {
    const easun = new EASUN("/dev/ttyUSB0");
    await easun.connect();

    const items = config.information.item as Array<OrigAddressConfig>;

    for (const item of items) {
        if ((typeof item.address === "number") && (item.len <= 4)) {
            const num = await easun.readNumberFormatted(item as any);
            console.log(item.ename + ": " + num);
            await sleep(10);
        }
    }
}

async function params() {
    const easun = new EASUN("/dev/ttyUSB0");
    await easun.connect();

    const items = config.parameters.item as Array<OrigAddressConfig>;

    for (const item of items) {
        if ((typeof item.address === "number") && (item.len === 1)) {
            const num = await easun.readNumberFormatted(item as any);
            console.log(item.ename + ": " + num);
            await sleep(config.app.infoInterval);
        }
    }
}

async function api(): Promise<void> {
    const easun = new EASUN("/dev/ttyUSB0");
    await easun.connect();

    // console.log(await easun.getMaxChargerCurrent());
    // console.log(await easun.setMaxChargerCurrent(42.5));
    // console.log(await easun.getMaxChargerCurrent());
    console.log(await easun.getMachineState());


    // const result = await easun.readAddress(ModbusDevice.ValueConfig.MainPageLog);
    // if (result) {
    //     console.log(result.data);
    // }

    process.exit();
}

/*
async function freq() {
    const easun = new ModbusDevice("/dev/ttyUSB0");
    await easun.connect();

    const item: AddressConfig = {
        "no": 2,
        "ctl": "lblName02",
        "ename": "Output Frequency",
        "address": 57865,
        "len": 1,
        "rate": 0.01,
        "format": "%.2f",
        "unit": "Hz",
        "sel": {
            "item": [
                {
                    "no": 50,
                    "ename": 50
                },
                {
                    "no": 60,
                    "ename": 60
                }
            ]
        }
    }

    console.log(await easun.readNumberFormatted(item));

}
*/

// test().then(() => process.exit());
// info().then(() => process.exit());
// batCharge().then(() => process.exit());
// params().then(() => process.exit());
// maxCurrent().then(() => process.exit());
api().then(() => process.exit());
