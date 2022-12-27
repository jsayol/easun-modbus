import { EASUN } from "./easun";
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

// async function test(): Promise<void> {
//     const easun = new EASUN("/dev/ttyUSB0");
//     await easun.connect();

//     const info = {
//         "ctl": "cmbStatistic",
//         "name": "Battery charge energy",
//         "address": 61447,
//         "len": 7,
//         "rate": 1,
//         "format": "%d",
//         "unit": "Ah"
//     };

//     const num = await easun._readNumber(info);
//     console.log(info.name + "(" + info.unit + "): " + num);

//     process.exit();
// }

// async function info() {
//     const easun = new EASUN("/dev/ttyUSB0");
//     await easun.connect();

//     const items = config.information.item as Array<OrigAddressConfig>;

//     for (const item of items) {
//         if ((typeof item.address === "number") && (item.len <= 4)) {
//             const num = await easun.readNumberFormatted(item as any);
//             console.log(item.ename + ": " + num);
//             await sleep(10);
//         }
//     }
// }

// async function params() {
//     const easun = new EASUN("/dev/ttyUSB0");
//     await easun.connect();

//     const items = config.parameters.item as Array<OrigAddressConfig>;

//     for (const item of items) {
//         if ((typeof item.address === "number") && (item.len === 1)) {
//             const num = await easun.readNumberFormatted(item as any);
//             console.log(item.ename + ": " + num);
//             await sleep(config.app.infoInterval);
//         }
//     }
// }

async function api(): Promise<void> {
    const easun = new EASUN("/dev/ttyUSB0");
    await easun.connect();

    // console.log(await easun.getMaxChargerCurrent());
    // console.log(await easun.setMaxChargerCurrent(42.5));
    // console.log(await easun.getMaxChargerCurrent());

    // console.log("getStats_BatteryChargeTotal", await easun.getStats_BatteryChargeTotal(true));
    // console.log("getStats_PVGenerateEnergyTotal", await easun.getStats_PVGenerateEnergyTotal(true));
    // console.log("getStats_WorkTimeTotalInInverter", await easun.getStats_WorkTimeTotalInInverter(true));
    // console.log("getStats_BatteryDischargeTotal", await easun.getStats_BatteryDischargeTotal(true));
    // console.log("getStats_LoadConsumEnergyTotal", await easun.getStats_LoadConsumEnergyTotal(true));
    // console.log("getStats_WorkTimeTotalInLine", await easun.getStats_WorkTimeTotalInLine(true));
    // console.log("getStatsWeek_PVEnergy", await easun.getStatsWeek_PVEnergy(true));
    // console.log("getStatsWeek_BatteryChargeEnergy", await easun.getStatsWeek_BatteryChargeEnergy(true));
    // console.log("getStatsWeek_BatteryDischargeEnergy", await easun.getStatsWeek_BatteryDischargeEnergy(true));
    // console.log("getStatsWeek_LineChargeEnergy", await easun.getStatsWeek_LineChargeEnergy(true));
    // console.log("getStatsWeek_LoadConsumEnergy", await easun.getStatsWeek_LoadConsumEnergy(true));
    // console.log("getStatsWeek_LoadConsumEnergyFromLine", await easun.getStatsWeek_LoadConsumEnergyFromLine(true));
    // console.log("getStatsDay_PVEnergy", await easun.getStatsDay_PVEnergy(true));
    // console.log("getStatsDay_BatteryChargeEnergy", await easun.getStatsDay_BatteryChargeEnergy(true));
    // console.log("getStatsDay_BatteryDischargeEnergy", await easun.getStatsDay_BatteryDischargeEnergy(true));
    // console.log("getStatsDay_LineChargeEnergy", await easun.getStatsDay_LineChargeEnergy(true));
    // console.log("getStatsDay_LoadConsumEnergy", await easun.getStatsDay_LoadConsumEnergy(true));
    // console.log("getStatsDay_LoadConsumEnergyFromLine", await easun.getStatsDay_LoadConsumEnergyFromLine(true));

    console.log(await easun.getCustomerID());
    console.log(await easun.getInputPassword());
    console.log(await easun.getChangePassword());
    console.log(await easun.getReserved());
    console.log(await easun.getFunctionEnable1());
    console.log(await easun.getFunctionEnable2());



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
