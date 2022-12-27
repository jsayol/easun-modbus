import util from "util";
import ModbusRTU from "modbus-serial";
import { ReadRegisterResult, WriteRegisterResult, SerialPortOptions } from "modbus-serial/ModbusRTU";

export { SerialPortOptions } from "modbus-serial/ModbusRTU";

interface AddressConfig {
    name: string,
    address: number,
    len: number,
    maxLen?: number,
    rate: number,
    format: string, // util.format()
    unit: string,
    signed?: "S",
    sel?: { item: Array<{ no: number, ename: string | number }> }
}

export interface MainConfig {
    baudRate: number, // 9600,
    dataBits: number, // 8,
    flowControl: boolean, // false,
    parity: 'none' | 'even' | 'mark' | 'odd' | 'space', // none
    stopBit: number, // 1

}

export class EASUN {
    private static MODBUSID = 1;
    private static MINWAIT = 100; // ms
    private static DEFAULT_TIMEOUT = 5000;
    private static DEFAULT_OPTIONS: SerialPortOptions = {
        baudRate: 9600,
        dataBits: 8,
        flowControl: false,
        parity: 'none',
        stopBits: 1
    };

    private client: ModbusRTU;
    private lastOp: number = Date.now();

    private static sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    constructor(private port: string, private options: SerialPortOptions = {}) {
        this.client = new ModbusRTU();
    }

    async connect() {
        try {
            this.client.setTimeout(EASUN.DEFAULT_TIMEOUT);
            this.client.setID(EASUN.MODBUSID);
            await this.client.connectRTUBuffered(this.port, { ...EASUN.DEFAULT_OPTIONS, ...this.options });
        } catch (err) {
            console.error(err);
        }
    }

    get timeout(): number {
        return this.client.getTimeout();
    }

    set timeout(value: number) {
        this.client.setTimeout(value);
    }

    /*private*/ async readAddress(config: AddressConfig): Promise<ReadRegisterResult | void> {
        const now = Date.now();
        const sinceLast = now - this.lastOp;

        if (sinceLast < EASUN.MINWAIT) {
            await EASUN.sleep(EASUN.MINWAIT - sinceLast);
        }

        try {
            return this.client.readHoldingRegisters(config.address, config.len);
        } catch (err) {
            console.error(err);
        }
    }

    async readNumber(config: AddressConfig): Promise<number | void> {
        const result = await this.readAddress(config);

        if (result) {
            const { data, buffer } = result;

            let value = 0;
            for (let i = 0; i < data.length; i++) {
                value += data[i] << (i * 16);
            }

            return value / (1 / config.rate);

            // if (config.signed === "S") {
            //     num = buffer.readIntBE(0, 2 * config.len);
            // } else {
            //     num = buffer.readUIntBE(0, 2 * config.len);
            // }

            // return num / (1 / config.rate);


        }
    }

    async readString(config: AddressConfig): Promise<string | void> {
        const result = await this.readAddress(config);

        if (result) {
            return String.fromCharCode(...result.data);
        }
    }

    async readNumberFormatted(config: AddressConfig): Promise<string> {
        const num = await this.readNumber(config);

        if (typeof num !== "undefined") {
            return EASUN.formatNumber(num, config);
        } else {
            return "";
        }
    }

    static formatNumber(num: number, config: AddressConfig): string {
        let stringNum: string;
        const matchFloat = config.format.match(/^%\.(\d+)f$/);

        if (matchFloat) {
            const decimals = Number(matchFloat[1]);
            stringNum = num.toFixed(decimals);
        } else if (config.format.length > 0) {
            stringNum = util.format(config.format, num);
        } else {
            stringNum = String(num);
        }

        stringNum = stringNum + config.unit;

        if (config.sel) {
            const item = config.sel.item.find(item => item.no === num);
            if (item) {
                stringNum = `${item.ename} (${stringNum})`;
            }
        }

        return stringNum;
    }

    async writeNumber(config: AddressConfig, value: number): Promise<WriteRegisterResult | void> {
        try {
            return this.client.writeRegister(config.address, Math.round(value / config.rate));
        } catch (err) {
            console.error(err);
        }
    }

    static ValueConfig: { [name: string]: AddressConfig } = {
        MainPageLog: {
            "address": 57129,
            "len": 16,
            "rate": 1,
            "format": "%a",
            "unit": "",
            "name": "Main page log"
        },
        SoftwareVersion1: {
            "address": 20,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "V",
            "name": "Software version 1"
        },
        SoftwareVersion2: {
            "address": 21,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "V",
            "name": "Software version 2"
        },
        CompileTime: {
            "address": 33,
            "len": 20,
            "rate": 1,
            "format": "%s",
            "unit": "",
            "name": "Compile time"
        },
        ProductSN: {
            "address": 53,
            "len": 20,
            "rate": 1,
            "format": "%s",
            "unit": "",
            "name": "Product SN"
        },
        PowerRate: {
            "address": 57624,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "kW",
            "name": "Power rate"
        },
        PVStatus: {
            "address": 265,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "PV status"
        },
        LineStatus: {
            "address": 528,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Line status"
        },
        BatteryStatus: {
            "address": 258,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Battery status"
        },
        LoadStatus: {
            "address": 539,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Load status"
        },
        CurrentFault: {
            "address": 516,
            "len": 4,
            "maxLen": 31,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Current fault"
        },
        PVVoltage1: {
            "address": 263,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "PV voltage1"
        },
        PVCurrent: {
            "address": 264,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "A",
            "name": "PV current"
        },
        PVPower: {
            "address": 265,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "W",
            "name": "PV power"
        },
        LineVoltage: {
            "address": 531,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Line voltage"
        },
        LineCurrent: {
            "address": 532,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "A",
            "name": "Line current"
        },
        LineFrequency: {
            "address": 533,
            "len": 1,
            "rate": 0.01,
            "format": "%.2f",
            "unit": "Hz",
            "name": "Line frequency"
        },
        BatteryType: {
            "address": 57348,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "sel": {
                "item": [
                    {
                        "no": 0,
                        "ename": "User def"
                    },
                    {
                        "no": 1,
                        "ename": "SLD"
                    },
                    {
                        "no": 2,
                        "ename": "FLD"
                    },
                    {
                        "no": 3,
                        "ename": "GEL"
                    },
                    {
                        "no": 4,
                        "ename": "LF14"
                    },
                    {
                        "no": 5,
                        "ename": "LF15"
                    },
                    {
                        "no": 6,
                        "ename": "LF16"
                    },
                    {
                        "no": 7,
                        "ename": "LF7"
                    },
                    {
                        "no": 8,
                        "ename": "LF8"
                    },
                    {
                        "no": 9,
                        "ename": "LF9"
                    },
                    {
                        "no": 10,
                        "ename": "NCA7"
                    },
                    {
                        "no": 11,
                        "ename": "NCA8"
                    },
                    {
                        "no": 12,
                        "ename": "NCA13"
                    },
                    {
                        "no": 13,
                        "ename": "NCA14"
                    }
                ]
            },
            "name": "Battery type"
        },
        BatteryVoltage: {
            "address": 257,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Battery voltage"
        },
        BatteryCurrent: {
            "address": 258,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "A",
            "signed": "S",
            "name": "Battery current"
        },
        BatterySOC: {
            "address": 256,
            "len": 1,
            "maxLen": 15,
            "rate": 1,
            "format": "%d",
            "unit": "%",
            "name": "Battery SOC(%)"
        },
        ChgCurrentByLine: {
            "address": 542,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "A",
            "signed": "S",
            "name": "Chg current by line"
        },
        LoadVoltage: {
            "address": 534,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Load voltage"
        },
        LoadCurrent: {
            "address": 537,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "A",
            "name": "Load current"
        },
        LoadActivePower: {
            "address": 539,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "W",
            "name": "Load active power"
        },
        LoadApparentPower: {
            "address": 540,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "VA",
            "name": "Load apparent power"
        },
        LoadRatio: {
            "address": 543,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "%",
            "name": "Load ratio"
        },
        TemperatureDC: {
            "address": 544,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "℃",
            "signed": "S",
            "name": "Temperature DC"
        },
        TemperatureAC: {
            "address": 545,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "℃",
            "signed": "S",
            "name": "Temperature AC"
        },
        TemperatureTR: {
            "address": 546,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "℃",
            "signed": "S",
            "name": "Temperature TR"
        },
        InverterCurrent: {
            "address": 535,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "A",
            "name": "Inverter current"
        },
        InverterFrequency: {
            "address": 536,
            "len": 1,
            "rate": 0.01,
            "format": "%.2f",
            "unit": "Hz",
            "name": "Inverter frequency"
        },
        MachineState: {
            "address": 528,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "sel": {
                "item": [
                    {
                        "no": 0,
                        "ename": "Power on"
                    },
                    {
                        "no": 1,
                        "ename": "Stand by"
                    },
                    {
                        "no": 2,
                        "ename": "Initialization"
                    },
                    {
                        "no": 3,
                        "ename": "Soft start"
                    },
                    {
                        "no": 4,
                        "ename": "Running in line"
                    },
                    {
                        "no": 5,
                        "ename": "Running in inverter"
                    },
                    {
                        "no": 6,
                        "ename": "Invert to line"
                    },
                    {
                        "no": 7,
                        "ename": "Line to invert"
                    },
                    {
                        "no": 8,
                        "ename": "remain"
                    },
                    {
                        "no": 9,
                        "ename": "remain"
                    },
                    {
                        "no": 10,
                        "ename": "Shutdown"
                    },
                    {
                        "no": 11,
                        "ename": "Fault"
                    }
                ]
            },
            "name": "Machine state"
        },
        BatteryChargeStep: {
            "address": 267,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "sel": {
                "item": [
                    {
                        "no": 0,
                        "ename": "Not start"
                    },
                    {
                        "no": 1,
                        "ename": "Const current"
                    },
                    {
                        "no": 2,
                        "ename": "Const voltage"
                    },
                    {
                        "no": 3,
                        "ename": "reserved"
                    },
                    {
                        "no": 4,
                        "ename": "Float charge"
                    },
                    {
                        "no": 5,
                        "ename": "reserved"
                    },
                    {
                        "no": 6,
                        "ename": "Active charge"
                    },
                    {
                        "no": 7,
                        "ename": "Active charge"
                    }
                ]
            },
            "name": "Battery charge step"
        },
        OutputPriority: {
            "address": 57860,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "sel": {
                "item": [
                    {
                        "no": 0,
                        "ename": "solar first"
                    },
                    {
                        "no": 1,
                        "ename": "line first"
                    },
                    {
                        "no": 2,
                        "ename": "sbu first"
                    }
                ]
            },
            "name": "Output priority"
        },
        PVGenerateEnergyTotal: {
            "address": 61496,
            "len": 2,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "kWh",
            "name": "PV generate energy total"
        },
        LoadConsumEnergyTotal: {
            "address": 61498,
            "len": 2,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "kWh",
            "name": "Load consum energy total"
        },
        PVGenerateEnergyToday: {
            "address": 61487,
            "len": 1,
            "maxLen": 13,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "kWh",
            "name": "PV generate energy today"
        },
        LoadConsumEnergyToday: {
            "address": 61488,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "kWh",
            "name": "Load consum energy today"
        },
        OutputFrequency: {
            "address": 57865,
            "len": 1,
            "rate": 0.01,
            "format": "%.2f",
            "unit": "Hz",
            "name": "Output Frequency"
        },
        AcInputVoltageRange: {
            "address": 57867,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Ac Input Voltage Range"
        },
        TurnToMainsVolt: {
            "address": 57371,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Turn to mains volt"
        },
        TurnToInverterVolt: {
            "address": 57378,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Turn to inverter volt"
        },
        ChargerSourcePriority: {
            "address": 57871,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Charger source priority"
        },
        MaxChargerCurrent: {
            "address": 57866,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "A",
            "name": "Max charger current"
        },
        BatteryBoostChargeVoltage: {
            "address": 57352,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Battery boost charge voltage"
        },
        BatteryBoostChargeTime: {
            "address": 57362,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "Min",
            "name": "Battery boost charge time"
        },
        BatteryFloatingChargeVoltage: {
            "address": 57353,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Battery floating charge voltage"
        },
        BatteryOverDischargeVoltage: {
            "address": 57357,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Battery over discharge voltage"
        },
        BatteryOverDischargeDelayTime: {
            "address": 57360,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "S",
            "name": "Battery over discharge delay time"
        },
        BatteryUnderVoltageAlarm: {
            "address": 57356,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Battery under voltage alarm"
        },
        BatteryDischargeLimitVoltage: {
            "address": 57358,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Battery discharge limit voltage"
        },
        BatteryEqualizationEnable: {
            "address": 57862,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "V",
            "name": "Battery equalization enable"
        },
        BatteryEqualizationVoltage: {
            "address": 57351,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Battery equalization voltage"
        },
        BatteryEqualizedTime: {
            "address": 57361,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "Min",
            "name": "Battery equalized time"
        },
        BatteryEqualizedTimeOut: {
            "address": 57379,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "Min",
            "name": "Battery equalized time out"
        },
        BatteryEqualizationInterval: {
            "address": 57363,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "Day",
            "name": "Battery equalization interval"
        },
        BatteryEqualizationImmediately: {
            "address": 57101,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Battery equalization immediately"
        },
        PowerSavingMode: {
            "address": 57868,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Power saving mode"
        },
        RestartWhenOverLoad: {
            "address": 57869,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Restart when over load"
        },
        RestartWhenOverTemperature: {
            "address": 57870,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Restart when over temperature"
        },
        AlarmEnable: {
            "address": 57872,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Alarm enable"
        },
        InputChangeAlarm: {
            "address": 57873,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Input change alarm"
        },
        BypassOutputWhenOverLoad: {
            "address": 57874,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Bypass output when over load"
        },
        MaxACChargerCurrent: {
            "address": 57861,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "A",
            "name": "Max AC charger current"
        },
        SplitPhase: {
            "address": 57876,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Split Phase"
        },
        RS485Address: {
            "address": 57856,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "RS485 Address"
        },
        ParallelMode: {
            "address": 57857,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Parallel Mode"
        },
        BMSEnable: {
            "address": 57877,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "BMS enable"
        },
        BMSProtocol: {
            "address": 57883,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "BMS Protocol"
        },
        Reserved: {
            "address": 57620,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "",
            "name": "Reserved"
        },
        BatteryUndervoltageRecovery: {
            "address": 57355,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Battery undervoltage recovery"
        },
        MaxPVChargerCurrent: {
            "address": 57345,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "A",
            "name": "Max PV charger current"
        },
        BatteryChargeRecovery: {
            "address": 57354,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Battery charge recovery"
        },
        OutputVoltageSet: {
            "address": 57864,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "V",
            "name": "Output voltage set"
        },
        SystemDateTime: {
            "address": 524,
            "len": 3,
            "rate": 1,
            "format": "%zdt",
            "unit": "",
            "name": "System date time"
        },
        InputPassword: {
            "address": 57859,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Input password"
        },
        ChangePassword: {
            "address": 57858,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Change password"
        },
        CustomerID: {
            "address": 57623,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Customer ID"
        },
        PVVoltageRate: {
            "address": 57631,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "V",
            "name": "PV voltage rate"
        },
        MaxChargeCurrentByPV: {
            "address": 57632,
            "len": 1,
            "rate": 0.1,
            "format": "%.1f",
            "unit": "A",
            "name": "Max charge current by PV"
        },
        FunctionEnable1: {
            "address": 57629,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Function enable 1"
        },
        FunctionEnable2: {
            "address": 57630,
            "len": 1,
            "rate": 1,
            "format": "%d",
            "unit": "",
            "name": "Function enable 2"
        },

    };

    /** Information */

    // getMainPageLog(): Promise<number | void> {
    //     return this.readNumber(ModbusDevice.ValueConfig.MainPageLog);
    // }

    getSoftwareVersion1(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.SoftwareVersion1);
    }

    getSoftwareVersion2(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.SoftwareVersion2);
    }

    getCompileTime(): Promise<string | void> {
        // When trying to read, some times we get a CRC error
        return this.readString(EASUN.ValueConfig.CompileTime);
    }

    getProductSN(): Promise<string | void> {
        // When trying to read, some times we get a CRC error
        return this.readString(EASUN.ValueConfig.ProductSN);
    }

    getPowerRate(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.PowerRate);
    }

    getPVStatus(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.PVStatus);
    }

    getLineStatus(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.LineStatus);
    }

    getBatteryStatus(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryStatus);
    }

    getLoadStatus(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.LoadStatus);
    }

    // getCurrentFault(): Promise<number | void> {
    //     return this.readNumber(ModbusDevice.ValueConfig.CurrentFault);
    // }

    getPVVoltage1(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.PVVoltage1);
    }

    getPVCurrent(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.PVCurrent);
    }

    getPVPower(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.PVPower);
    }

    getLineVoltage(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.LineVoltage);
    }

    getLineCurrent(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.LineCurrent);
    }

    getLineFrequency(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.LineFrequency);
    }

    getBatteryType(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryType);
    }

    getBatteryVoltage(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryVoltage);
    }

    getBatteryCurrent(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryCurrent);
    }

    getBatterySOC(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatterySOC);
    }

    getChgCurrentByLine(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.ChgCurrentByLine);
    }

    getLoadVoltage(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.LoadVoltage);
    }

    getLoadCurrent(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.LoadCurrent);
    }

    getLoadActivePower(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.LoadActivePower);
    }

    getLoadApparentPower(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.LoadApparentPower);
    }

    getLoadRatio(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.LoadRatio);
    }

    getTemperatureDC(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.TemperatureDC);
    }

    getTemperatureAC(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.TemperatureAC);
    }

    getTemperatureTR(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.TemperatureTR);
    }

    getInverterCurrent(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.InverterCurrent);
    }

    getInverterFrequency(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.InverterFrequency);
    }

    getMachineState(): Promise<EASUN.MachineState | void> {
        return this.readNumber(EASUN.ValueConfig.MachineState);
    }

    getBatteryChargeStep(): Promise<EASUN.BatteryChargeStep | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryChargeStep);
    }

    getOutputPriority(): Promise<EASUN.OutputPriority | void> {
        return this.readNumber(EASUN.ValueConfig.OutputPriority);
    }

    // getPVGenerateEnergyTotal(): Promise<number | void> {
    //     return this.readNumber(ModbusDevice.ValueConfig.PVGenerateEnergyTotal);
    // }

    // getLoadConsumEnergyTotal(): Promise<number | void> {
    //     return this.readNumber(ModbusDevice.ValueConfig.LoadConsumEnergyTotal);
    // }

    getPVGenerateEnergyToday(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.PVGenerateEnergyToday);
    }

    getLoadConsumEnergyToday(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.LoadConsumEnergyToday);
    }

    /** Parameters */

    async setOutputPriority(value: EASUN.OutputPriority): Promise<EASUN.OutputPriority | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.OutputPriority, value);
        if (result) {
            return result.value;
        }
    }

    getOutputFrequency(): Promise<EASUN.OutputFrequency | void> {
        return this.readNumber(EASUN.ValueConfig.OutputFrequency);
    }

    async setOutputFrequency(value: EASUN.OutputFrequency): Promise<EASUN.OutputFrequency | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.OutputFrequency, value);
        if (result) {
            return result.value;
        }
    }

    getAcInputVoltageRange(): Promise<EASUN.AcInputVoltageRange | void> {
        return this.readNumber(EASUN.ValueConfig.AcInputVoltageRange);
    }

    async setAcInputVoltageRange(value: EASUN.AcInputVoltageRange): Promise<EASUN.AcInputVoltageRange | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.AcInputVoltageRange, value);
        if (result) {
            return result.value;
        }
    }

    getTurnToMainsVolt(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.TurnToMainsVolt);
    }

    async setTurnToMainsVolt(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.TurnToMainsVolt, value);
        if (result) {
            return result.value;
        }
    }

    getTurnToInverterVolt(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.TurnToInverterVolt);
    }

    async setTurnToInverterVolt(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.TurnToInverterVolt, value);
        if (result) {
            return result.value;
        }
    }

    getChargerSourcePriority(): Promise<EASUN.ChargerSourcePriority | void> {
        return this.readNumber(EASUN.ValueConfig.ChargerSourcePriority);
    }

    async setChargerSourcePriority(value: EASUN.ChargerSourcePriority): Promise<EASUN.ChargerSourcePriority | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.ChargerSourcePriority, value);
        if (result) {
            return result.value;
        }
    }

    getMaxChargerCurrent(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.MaxChargerCurrent);
    }

    async setMaxChargerCurrent(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.MaxChargerCurrent, value);
        if (result) {
            return result.value;
        }
    }

    async setBatteryType(value: EASUN.BatteryType): Promise<EASUN.BatteryType | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryType, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryBoostChargeVoltage(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryBoostChargeVoltage);
    }

    async setBatteryBoostChargeVoltage(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryBoostChargeVoltage, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryBoostChargeTime(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryBoostChargeTime);
    }

    async setBatteryBoostChargeTime(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryBoostChargeTime, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryFloatingChargeVoltage(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryFloatingChargeVoltage);
    }

    async setBatteryFloatingChargeVoltage(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryFloatingChargeVoltage, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryOverDischargeVoltage(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryOverDischargeVoltage);
    }

    async setBatteryOverDischargeVoltage(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryOverDischargeVoltage, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryOverDischargeDelayTime(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryOverDischargeDelayTime);
    }

    async setBatteryOverDischargeDelayTime(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryOverDischargeDelayTime, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryUnderVoltageAlarm(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryUnderVoltageAlarm);
    }

    async setBatteryUnderVoltageAlarm(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryUnderVoltageAlarm, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryDischargeLimitVoltage(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryDischargeLimitVoltage);
    }

    async setBatteryDischargeLimitVoltage(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryDischargeLimitVoltage, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryEqualizationEnable(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryEqualizationEnable);
    }

    async setBatteryEqualizationEnable(value: EASUN.BatteryEqualizationEnable): Promise<EASUN.BatteryEqualizationEnable | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizationEnable, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryEqualizationVoltage(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryEqualizationVoltage);
    }

    async setBatteryEqualizationVoltage(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizationVoltage, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryEqualizedTime(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryEqualizedTime);
    }

    async setBatteryEqualizedTime(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizedTime, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryEqualizedTimeOut(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryEqualizedTimeOut);
    }

    async setBatteryEqualizedTimeOut(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizedTimeOut, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryEqualizationInterval(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryEqualizationInterval);
    }

    async setBatteryEqualizationInterval(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizationInterval, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryEqualizationImmediately(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryEqualizationImmediately);
    }

    async setBatteryEqualizationImmediately(value: EASUN.BatteryEqualizationImmediately): Promise<EASUN.BatteryEqualizationImmediately | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizationImmediately, value);
        if (result) {
            return result.value;
        }
    }

    getPowerSavingMode(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.PowerSavingMode);
    }

    async setPowerSavingMode(value: EASUN.PowerSavingMode): Promise<EASUN.PowerSavingMode | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.PowerSavingMode, value);
        if (result) {
            return result.value;
        }
    }

    getRestartWhenOverLoad(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.RestartWhenOverLoad);
    }

    async setRestartWhenOverLoad(value: EASUN.RestartWhenOverLoad): Promise<EASUN.RestartWhenOverLoad | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.RestartWhenOverLoad, value);
        if (result) {
            return result.value;
        }
    }

    getRestartWhenOverTemperature(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.RestartWhenOverTemperature);
    }

    async setRestartWhenOverTemperature(value: EASUN.RestartWhenOverTemperature): Promise<EASUN.RestartWhenOverTemperature | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.RestartWhenOverTemperature, value);
        if (result) {
            return result.value;
        }
    }

    getAlarmEnable(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.AlarmEnable);
    }

    async setAlarmEnable(value: EASUN.AlarmEnable): Promise<EASUN.AlarmEnable | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.AlarmEnable, value);
        if (result) {
            return result.value;
        }
    }

    getInputChangeAlarm(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.InputChangeAlarm);
    }

    async setInputChangeAlarm(value: EASUN.InputChangeAlarm): Promise<EASUN.InputChangeAlarm | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.InputChangeAlarm, value);
        if (result) {
            return result.value;
        }
    }

    getBypassOutputWhenOverLoad(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BypassOutputWhenOverLoad);
    }

    async setBypassOutputWhenOverLoad(value: EASUN.BypassOutputWhenOverLoad): Promise<EASUN.BypassOutputWhenOverLoad | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BypassOutputWhenOverLoad, value);
        if (result) {
            return result.value;
        }
    }

    getMaxACChargerCurrent(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.MaxACChargerCurrent);
    }

    async setMaxACChargerCurrent(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.MaxACChargerCurrent, value);
        if (result) {
            return result.value;
        }
    }

    getSplitPhase(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.SplitPhase);
    }

    async setSplitPhase(value: EASUN.SplitPhase): Promise<EASUN.SplitPhase | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.SplitPhase, value);
        if (result) {
            return result.value;
        }
    }

    getRS485Address(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.RS485Address);
    }

    async setRS485Address(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.RS485Address, value);
        if (result) {
            return result.value;
        }
    }

    getParallelMode(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.ParallelMode);
    }

    async setParallelMode(value: EASUN.ParallelMode): Promise<EASUN.ParallelMode | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.ParallelMode, value);
        if (result) {
            return result.value;
        }
    }

    getBMSEnable(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BMSEnable);
    }

    async setBMSEnable(value: EASUN.BMSEnable): Promise<EASUN.BMSEnable | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BMSEnable, value);
        if (result) {
            return result.value;
        }
    }

    getBMSProtocol(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BMSProtocol);
    }

    async setBMSProtocol(value: EASUN.BMSProtocol): Promise<EASUN.BMSProtocol | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BMSProtocol, value);
        if (result) {
            return result.value;
        }
    }

    getReserved(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.Reserved);
    }

    async setReserved(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.Reserved, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryUndervoltageRecovery(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryUndervoltageRecovery);
    }

    async setBatteryUndervoltageRecovery(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryUndervoltageRecovery, value);
        if (result) {
            return result.value;
        }
    }

    getMaxPVChargerCurrent(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.MaxPVChargerCurrent);
    }

    async setMaxPVChargerCurrent(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.MaxPVChargerCurrent, value);
        if (result) {
            return result.value;
        }
    }

    getBatteryChargeRecovery(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.BatteryChargeRecovery);
    }

    async setBatteryChargeRecovery(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryChargeRecovery, value);
        if (result) {
            return result.value;
        }
    }

    getOutputVoltageSet(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.OutputVoltageSet);
    }

    async setOutputVoltageSet(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.OutputVoltageSet, value);
        if (result) {
            return result.value;
        }
    }

    getSystemDateTime(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.SystemDateTime);
    }

    async setSystemDateTime(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.SystemDateTime, value);
        if (result) {
            return result.value;
        }
    }

    getInputPassword(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.InputPassword);
    }

    async setInputPassword(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.InputPassword, value);
        if (result) {
            return result.value;
        }
    }

    getChangePassword(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.ChangePassword);
    }

    async setChangePassword(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.ChangePassword, value);
        if (result) {
            return result.value;
        }
    }

    getCustomerID(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.CustomerID);
    }

    async setCustomerID(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.CustomerID, value);
        if (result) {
            return result.value;
        }
    }

    async setPowerRate(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.PowerRate, value);
        if (result) {
            return result.value;
        }
    }

    getPVVoltageRate(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.PVVoltageRate);
    }

    async setPVVoltageRate(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.PVVoltageRate, value);
        if (result) {
            return result.value;
        }
    }

    getMaxChargeCurrentByPV(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.MaxChargeCurrentByPV);
    }

    async setMaxChargeCurrentByPV(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.MaxChargeCurrentByPV, value);
        if (result) {
            return result.value;
        }
    }

    getFunctionEnable1(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.FunctionEnable1);
    }

    async setFunctionEnable1(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.FunctionEnable1, value);
        if (result) {
            return result.value;
        }
    }

    getFunctionEnable2(): Promise<number | void> {
        return this.readNumber(EASUN.ValueConfig.FunctionEnable2);
    }

    async setFunctionEnable2(value: number): Promise<number | void> {
        const result = await this.writeNumber(EASUN.ValueConfig.FunctionEnable2, value);
        if (result) {
            return result.value;
        }
    }
}

export namespace EASUN {
    export enum MachineState {
        PowerOn = 0,
        StandBy = 1,
        Initialization = 2,
        SoftStart = 3,
        RunningInLine = 4,
        RunningInInverter = 5,
        InvertToLine = 6,
        LineToInvert = 7,
        Remain = 8,
        Remain_ = 9,
        Shutdown = 10,
        Fault = 11
    }

    export enum BatteryChargeStep {
        NotStart = 0,
        ConstCurrent = 1,
        ConstVoltage = 2,
        Reserved1 = 3,
        FloatCharge = 4,
        Reserved2 = 5,
        ActiveCharge = 6,
        ActiveCharge_ = 7
    }

    export enum OutputPriority {
        PVFirst = 0,
        MainsFirst = 1,
        BatteryFirst = 2
    }

    export enum OutputFrequency {
        HZ50 = 50,
        HZ60 = 60
    }

    export enum AcInputVoltageRange {
        APL = 0,
        UPS = 1
    }

    export enum ChargerSourcePriority {
        PVFirst = 0,
        MainsFirst = 1,
        PVAndMains = 2,
        OnlyPV = 3
    }

    export enum BatteryType {
        UserDefined = 0,
        SLD = 1,
        FLD = 2,
        GEL = 3,
        LiFePoX14 = 4,
        LiFePoX15 = 5,
        LiFePoX16 = 6,
        LiFePoX7 = 7,
        LiFePoX8 = 8,
        LiFePoX9 = 9,
        TernaryLiX7 = 10,
        TernaryLiX8 = 11,
        TernaryLiX13 = 12,
        TernaryLiX14 = 13
    }

    export enum BatteryEqualizationEnable {
        Disable = 0,
        Enable = 1
    }

    export enum BatteryEqualizationImmediately {
        Disable = 0,
        Enable = 1
    }

    export enum PowerSavingMode {
        Disable = 0,
        Enable = 1
    }

    export enum RestartWhenOverLoad {
        Disable = 0,
        Enable = 1
    }

    export enum RestartWhenOverTemperature {
        Disable = 0,
        Enable = 1
    }

    export enum AlarmEnable {
        Disable = 0,
        Enable = 1
    }

    export enum InputChangeAlarm {
        Disable = 0,
        Enable = 1
    }

    export enum BypassOutputWhenOverLoad {
        Disable = 0,
        Enable = 1
    }

    export enum SplitPhase {
        Disable = 0,
        Enable = 1
    }

    export enum ParallelMode {
        StandAlone = 0,
        ParallelSinglePhase = 1,
        ParallelSplitPhase0deg = 2,
        ParallelSplitPhase120deg = 3,
        ParallelSplitPhase180deg = 4,
        ParallelThreePhaseA = 5,
        ParallelThreePhaseB = 6,
        ParallelThreePhaseC = 7
    }

    export enum BMSEnable {
        Disable = 0,
        BMS458 = 1,
        BMSCAN = 2
    }

    export enum BMSProtocol {
        Pace = 0,
        Rata = 1,
        Allgrand = 2,
        Oliter = 3,
        PCT = 4,
        Sunwoda = 5,
        Dyness = 6,
        WOW = 7,
        Pylontech = 8,
        WSTechnicals = 16,
        UzEnergy = 17
    }
}
