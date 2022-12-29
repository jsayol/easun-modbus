"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EASUN = void 0;
const util_1 = __importDefault(require("util"));
const modbus_serial_1 = __importDefault(require("modbus-serial"));
function assert(condition, errMsg) {
    if (!condition) {
        throw new Error(errMsg);
    }
}
class EASUN {
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    constructor(port, options = {}) {
        this.port = port;
        this.options = options;
        this.lastOp = Date.now();
        this.client = new modbus_serial_1.default();
    }
    async connect() {
        try {
            this.client.setTimeout(EASUN.DEFAULT_TIMEOUT);
            this.client.setID(EASUN.MODBUSID);
            await this.client.connectRTUBuffered(this.port, { ...EASUN.DEFAULT_OPTIONS, ...this.options });
        }
        catch (err) {
            console.error(err);
        }
    }
    get timeout() {
        return this.client.getTimeout();
    }
    set timeout(value) {
        this.client.setTimeout(value);
    }
    async _readAddress(config) {
        const now = Date.now();
        const sinceLast = now - this.lastOp;
        if (sinceLast < EASUN.MINWAIT) {
            await EASUN.sleep(EASUN.MINWAIT - sinceLast);
        }
        this.lastOp = Date.now();
        try {
            return this.client.readHoldingRegisters(config.address, config.len);
        }
        catch (err) {
            console.error(err);
        }
    }
    async _readNumber(config) {
        const result = await this._readAddress(config);
        if (result) {
            const { data, buffer } = result;
            let value = 0;
            for (let i = 0; i < data.length; i++) {
                value += data[i] << (i * 16);
            }
            return value / (1 / config.rate);
        }
    }
    async _readString(config) {
        const result = await this._readAddress(config);
        if (result) {
            return String.fromCharCode(...result.data);
        }
    }
    static formatNumber(num, config) {
        let stringNum;
        const matchFloat = config.format.match(/^%\.(\d+)f$/);
        if (matchFloat) {
            const decimals = Number(matchFloat[1]);
            stringNum = num.toFixed(decimals);
        }
        else if (config.format.length > 0) {
            stringNum = util_1.default.format(config.format, num);
        }
        else {
            stringNum = String(num);
        }
        if (config.unit.length > 0) {
            stringNum = stringNum + " " + config.unit;
        }
        if (config.sel) {
            const item = config.sel.item.find(item => item.no === num);
            if (item) {
                stringNum = `${item.ename} (${stringNum})`;
            }
        }
        return stringNum;
    }
    static formatDateValue(values) {
        if (Array.isArray(values) && (values.length === 6)) {
            let [year, month, day, hour, minute, second] = values;
            return new Date(1970 + year, month, day, hour, minute, second);
        }
    }
    async writeNumber(config, value) {
        const now = Date.now();
        const sinceLast = now - this.lastOp;
        if (sinceLast < EASUN.MINWAIT) {
            await EASUN.sleep(EASUN.MINWAIT - sinceLast);
        }
        this.lastOp = Date.now();
        try {
            const result = await this.client.writeRegister(config.address, Math.round(value / config.rate));
            if (result) {
                result.value = result.value * config.rate;
                return result;
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    async _getNumberValue(format = false, config) {
        const num = await this._readNumber(config);
        if (typeof num !== "undefined") {
            if (format) {
                return EASUN.formatNumber(num, config);
            }
            else {
                return num;
            }
        }
    }
    /** Information */
    // getMainPageLog(): Promise<number | void> {
    //     return this.readNumber(ModbusDevice.ValueConfig.MainPageLog);
    // }
    getSoftwareVersion1() {
        return this._readNumber(EASUN.ValueConfig.SoftwareVersion1);
    }
    getSoftwareVersion2() {
        return this._readNumber(EASUN.ValueConfig.SoftwareVersion2);
    }
    getCompileTime() {
        // When trying to read, some times we get a CRC error
        return this._readString(EASUN.ValueConfig.CompileTime);
    }
    getProductSN() {
        // When trying to read, some times we get a CRC error
        return this._readString(EASUN.ValueConfig.ProductSN);
    }
    getPowerRate(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.PowerRate);
    }
    getPVVoltageRate(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.PVVoltageRate);
    }
    getPVStatus() {
        return this._readNumber(EASUN.ValueConfig.PVStatus);
    }
    getLineStatus() {
        return this._readNumber(EASUN.ValueConfig.LineStatus);
    }
    getBatteryStatus() {
        return this._readNumber(EASUN.ValueConfig.BatteryStatus);
    }
    getLoadStatus() {
        return this._readNumber(EASUN.ValueConfig.LoadStatus);
    }
    getPVVoltage1(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.PVVoltage1);
    }
    getPVCurrent(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.PVCurrent);
    }
    getPVPower(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.PVPower);
    }
    getLineVoltage(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.LineVoltage);
    }
    getLineCurrent(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.LineCurrent);
    }
    getLineFrequency(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.LineFrequency);
    }
    getBatteryType(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryType);
    }
    getBatteryVoltage(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryVoltage);
    }
    getBatteryCurrent(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryCurrent);
    }
    getBatterySOC(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatterySOC);
    }
    getChgCurrentByLine(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.ChgCurrentByLine);
    }
    getLoadVoltage(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.LoadVoltage);
    }
    getLoadCurrent(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.LoadCurrent);
    }
    getLoadActivePower(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.LoadActivePower);
    }
    getLoadApparentPower(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.LoadApparentPower);
    }
    getLoadRatio(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.LoadRatio);
    }
    getTemperatureDC(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.TemperatureDC);
    }
    getTemperatureAC(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.TemperatureAC);
    }
    getTemperatureTR(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.TemperatureTR);
    }
    getInverterCurrent(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.InverterCurrent);
    }
    getInverterFrequency(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.InverterFrequency);
    }
    getMachineState() {
        return this._readNumber(EASUN.ValueConfig.MachineState);
    }
    getBatteryChargeStep() {
        return this._readNumber(EASUN.ValueConfig.BatteryChargeStep);
    }
    getOutputPriority() {
        return this._readNumber(EASUN.ValueConfig.OutputPriority);
    }
    getPVGenerateEnergyTotal(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.PVGenerateEnergyTotal);
    }
    getLoadConsumEnergyTotal(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.LoadConsumEnergyTotal);
    }
    getPVGenerateEnergyToday(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.PVGenerateEnergyToday);
    }
    getLoadConsumEnergyToday(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.LoadConsumEnergyToday);
    }
    /** Parameters */
    async setOutputPriority(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.OutputPriority, value);
        if (result) {
            return result.value;
        }
    }
    getOutputFrequency(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.OutputFrequency);
    }
    async setOutputFrequency(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.OutputFrequency, value);
        if (result) {
            return result.value;
        }
    }
    getAcInputVoltageRange(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.AcInputVoltageRange);
    }
    async setAcInputVoltageRange(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.AcInputVoltageRange, value);
        if (result) {
            return result.value;
        }
    }
    getTurnToMainsVolt(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.TurnToMainsVolt);
    }
    async setTurnToMainsVolt(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.TurnToMainsVolt, value);
        if (result) {
            return result.value;
        }
    }
    getTurnToInverterVolt(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.TurnToInverterVolt);
    }
    async setTurnToInverterVolt(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.TurnToInverterVolt, value);
        if (result) {
            return result.value;
        }
    }
    getChargerSourcePriority() {
        return this._readNumber(EASUN.ValueConfig.ChargerSourcePriority);
    }
    async setChargerSourcePriority(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.ChargerSourcePriority, value);
        if (result) {
            return result.value;
        }
    }
    getMaxChargerCurrent(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.MaxChargerCurrent);
    }
    async setMaxChargerCurrent(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.MaxChargerCurrent, value);
        if (result) {
            return result.value;
        }
    }
    async setBatteryType(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryType, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryBoostChargeVoltage(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryBoostChargeVoltage);
    }
    async setBatteryBoostChargeVoltage(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryBoostChargeVoltage, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryBoostChargeTime(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryBoostChargeTime);
    }
    async setBatteryBoostChargeTime(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryBoostChargeTime, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryFloatingChargeVoltage(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryFloatingChargeVoltage);
    }
    async setBatteryFloatingChargeVoltage(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryFloatingChargeVoltage, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryOverDischargeVoltage(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryOverDischargeVoltage);
    }
    async setBatteryOverDischargeVoltage(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryOverDischargeVoltage, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryOverDischargeDelayTime(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryOverDischargeDelayTime);
    }
    async setBatteryOverDischargeDelayTime(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryOverDischargeDelayTime, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryUnderVoltageAlarm(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryUnderVoltageAlarm);
    }
    async setBatteryUnderVoltageAlarm(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryUnderVoltageAlarm, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryDischargeLimitVoltage(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryDischargeLimitVoltage);
    }
    async setBatteryDischargeLimitVoltage(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryDischargeLimitVoltage, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryEqualizationEnable(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryEqualizationEnable);
    }
    async setBatteryEqualizationEnable(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizationEnable, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryEqualizationVoltage(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryEqualizationVoltage);
    }
    async setBatteryEqualizationVoltage(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizationVoltage, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryEqualizedTime(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryEqualizedTime);
    }
    async setBatteryEqualizedTime(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizedTime, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryEqualizedTimeOut(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryEqualizedTimeOut);
    }
    async setBatteryEqualizedTimeOut(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizedTimeOut, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryEqualizationInterval(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryEqualizationInterval);
    }
    async setBatteryEqualizationInterval(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizationInterval, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryEqualizationImmediately() {
        return this._readNumber(EASUN.ValueConfig.BatteryEqualizationImmediately);
    }
    async setBatteryEqualizationImmediately(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryEqualizationImmediately, value);
        if (result) {
            return result.value;
        }
    }
    getPowerSavingMode() {
        return this._readNumber(EASUN.ValueConfig.PowerSavingMode);
    }
    async setPowerSavingMode(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.PowerSavingMode, value);
        if (result) {
            return result.value;
        }
    }
    getRestartWhenOverLoad() {
        return this._readNumber(EASUN.ValueConfig.RestartWhenOverLoad);
    }
    async setRestartWhenOverLoad(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.RestartWhenOverLoad, value);
        if (result) {
            return result.value;
        }
    }
    getRestartWhenOverTemperature() {
        return this._readNumber(EASUN.ValueConfig.RestartWhenOverTemperature);
    }
    async setRestartWhenOverTemperature(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.RestartWhenOverTemperature, value);
        if (result) {
            return result.value;
        }
    }
    getAlarmEnable() {
        return this._readNumber(EASUN.ValueConfig.AlarmEnable);
    }
    async setAlarmEnable(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.AlarmEnable, value);
        if (result) {
            return result.value;
        }
    }
    getInputChangeAlarm() {
        return this._readNumber(EASUN.ValueConfig.InputChangeAlarm);
    }
    async setInputChangeAlarm(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.InputChangeAlarm, value);
        if (result) {
            return result.value;
        }
    }
    getBypassOutputWhenOverLoad() {
        return this._readNumber(EASUN.ValueConfig.BypassOutputWhenOverLoad);
    }
    async setBypassOutputWhenOverLoad(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BypassOutputWhenOverLoad, value);
        if (result) {
            return result.value;
        }
    }
    getMaxACChargerCurrent(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.MaxACChargerCurrent);
    }
    async setMaxACChargerCurrent(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.MaxACChargerCurrent, value);
        if (result) {
            return result.value;
        }
    }
    getSplitPhase() {
        return this._readNumber(EASUN.ValueConfig.SplitPhase);
    }
    async setSplitPhase(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.SplitPhase, value);
        if (result) {
            return result.value;
        }
    }
    getRS485Address(format = false) {
        return this._readNumber(EASUN.ValueConfig.RS485Address);
    }
    async setRS485Address(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.RS485Address, value);
        if (result) {
            return result.value;
        }
    }
    getParallelMode() {
        return this._readNumber(EASUN.ValueConfig.ParallelMode);
    }
    async setParallelMode(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.ParallelMode, value);
        if (result) {
            return result.value;
        }
    }
    getBMSEnable() {
        return this._readNumber(EASUN.ValueConfig.BMSEnable);
    }
    async setBMSEnable(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BMSEnable, value);
        if (result) {
            return result.value;
        }
    }
    getBMSProtocol() {
        return this._readNumber(EASUN.ValueConfig.BMSProtocol);
    }
    async setBMSProtocol(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BMSProtocol, value);
        if (result) {
            return result.value;
        }
    }
    getReserved() {
        return this._readNumber(EASUN.ValueConfig.Reserved);
    }
    async setReserved(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.Reserved, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryUndervoltageRecovery(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryUndervoltageRecovery);
    }
    async setBatteryUndervoltageRecovery(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryUndervoltageRecovery, value);
        if (result) {
            return result.value;
        }
    }
    getMaxPVChargerCurrent(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.MaxPVChargerCurrent);
    }
    async setMaxPVChargerCurrent(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.MaxPVChargerCurrent, value);
        if (result) {
            return result.value;
        }
    }
    getBatteryChargeRecovery(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.BatteryChargeRecovery);
    }
    async setBatteryChargeRecovery(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.BatteryChargeRecovery, value);
        if (result) {
            return result.value;
        }
    }
    getOutputVoltageSet(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.OutputVoltageSet);
    }
    async setOutputVoltageSet(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.OutputVoltageSet, value);
        if (result) {
            return result.value;
        }
    }
    async getSystemDateTime(format = false) {
        const result = await this._readAddress(EASUN.ValueConfig.SystemDateTime);
        if (result) {
            // console.log(result.data[2], ...result.data.map(v => v.toString(2).padStart(16, '0')));
            const { buffer } = result;
            const values = [];
            for (let i = 0; i < 6; i++) {
                values[i] = buffer.readUint8(i);
            }
            if (format) {
                return EASUN.formatDateValue(values);
            }
            else {
                return values;
            }
        }
    }
    async setSystemDateTime(value) {
        let arrValues;
        if (Array.isArray(value)) {
            assert(value.length === 6, "Value must be an array of 6 numbers");
            assert(value[1] > 0 && value[1] <= 12, "Month must be between 1 and 12");
            assert(value[2] > 0 && value[2] <= 31, "Day must be between 1 and 31");
            assert(value[3] >= 0 && value[3] < 24, "Hour must be between 0 and 23");
            assert(value[4] >= 0 && value[4] < 60, "Minute must be between 0 and 59");
            assert(value[5] >= 0 && value[5] < 60, "Second must be between 0 and 59");
            // value = EASUN.formatDateValue(value) as Date;
            arrValues = value;
        }
        else if (value instanceof Date) {
            arrValues = [
                value.getUTCFullYear() - 1970,
                value.getUTCMonth(),
                value.getUTCDay(),
                value.getUTCHours(),
                value.getUTCMinutes(),
                value.getUTCSeconds(),
            ];
        }
        else {
            throw new Error("Unknown value for SystemDateTime");
        }
        const registers = new Uint16Array(3);
        registers[0] = (arrValues[0] << 8) + arrValues[1];
        registers[0] = (arrValues[2] << 8) + arrValues[3];
        registers[0] = (arrValues[4] << 8) + arrValues[5];
        const result = await this.client.writeRegisters(EASUN.ValueConfig.SystemDateTime.address, [...registers]);
        return result.length;
    }
    getInputPassword() {
        return this._readNumber(EASUN.ValueConfig.InputPassword);
    }
    async setInputPassword(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.InputPassword, value);
        if (result) {
            return result.value;
        }
    }
    getChangePassword() {
        return this._readNumber(EASUN.ValueConfig.ChangePassword);
    }
    async setChangePassword(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.ChangePassword, value);
        if (result) {
            return result.value;
        }
    }
    getCustomerID() {
        return this._readNumber(EASUN.ValueConfig.CustomerID);
    }
    async setCustomerID(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.CustomerID, value);
        if (result) {
            return result.value;
        }
    }
    getMaxChargeCurrentByPV(format = false) {
        return this._getNumberValue(format, EASUN.ValueConfig.MaxChargeCurrentByPV);
    }
    async setMaxChargeCurrentByPV(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.MaxChargeCurrentByPV, value);
        if (result) {
            return result.value;
        }
    }
    getFunctionEnable1() {
        return this._readNumber(EASUN.ValueConfig.FunctionEnable1);
    }
    async setFunctionEnable1(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.FunctionEnable1, value);
        if (result) {
            return result.value;
        }
    }
    getFunctionEnable2() {
        return this._readNumber(EASUN.ValueConfig.FunctionEnable2);
    }
    async setFunctionEnable2(value) {
        const result = await this.writeNumber(EASUN.ValueConfig.FunctionEnable2, value);
        if (result) {
            return result.value;
        }
    }
    getStats_BatteryChargeTotal(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Total.BatteryChargeTotal);
    }
    getStats_PVGenerateEnergyTotal(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Total.PVGenerateEnergyTotal);
    }
    getStats_WorkTimeTotalInInverter(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Total.WorkTimeTotalInInverter);
    }
    getStats_BatteryDischargeTotal(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Total.BatteryDischargeTotal);
    }
    getStats_LoadConsumEnergyTotal(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Total.LoadConsumEnergyTotal);
    }
    getStats_WorkTimeTotalInLine(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Total.WorkTimeTotalInLine);
    }
    async _getStatsWeekValue(format = false, config) {
        const result = await this._readAddress(config);
        if (result) {
            let values = result.data.map(value => value / (1 / config.rate));
            if (format) {
                return values.map(value => EASUN.formatNumber(value, config));
            }
            else {
                return values;
            }
        }
    }
    async getStatsWeek_PVEnergy(format = false) {
        const config = EASUN.StatsConfig.Week.PVEnergy;
        return this._getStatsWeekValue(format, config);
    }
    async getStatsWeek_BatteryChargeEnergy(format = false) {
        const config = EASUN.StatsConfig.Week.BatteryChargeEnergy;
        return this._getStatsWeekValue(format, config);
    }
    async getStatsWeek_BatteryDischargeEnergy(format = false) {
        const config = EASUN.StatsConfig.Week.BatteryDischargeEnergy;
        return this._getStatsWeekValue(format, config);
    }
    async getStatsWeek_LineChargeEnergy(format = false) {
        const config = EASUN.StatsConfig.Week.LineChargeEnergy;
        return this._getStatsWeekValue(format, config);
    }
    async getStatsWeek_LoadConsumEnergy(format = false) {
        const config = EASUN.StatsConfig.Week.LoadConsumEnergy;
        return this._getStatsWeekValue(format, config);
    }
    async getStatsWeek_LoadConsumEnergyFromLine(format = false) {
        const config = EASUN.StatsConfig.Week.LoadConsumEnergyFromLine;
        return this._getStatsWeekValue(format, config);
    }
    getStatsDay_PVEnergy(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Day.PVEnergy);
    }
    getStatsDay_BatteryChargeEnergy(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Day.BatteryChargeEnergy);
    }
    getStatsDay_BatteryDischargeEnergy(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Day.BatteryDischargeEnergy);
    }
    getStatsDay_LineChargeEnergy(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Day.LineChargeEnergy);
    }
    getStatsDay_LoadConsumEnergy(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Day.LoadConsumEnergy);
    }
    getStatsDay_LoadConsumEnergyFromLine(format = false) {
        return this._getNumberValue(format, EASUN.StatsConfig.Day.LoadConsumEnergyFromLine);
    }
}
exports.EASUN = EASUN;
EASUN.MODBUSID = 1;
EASUN.MINWAIT = 50; // ms
EASUN.DEFAULT_TIMEOUT = 5000; // ms
EASUN.DEFAULT_OPTIONS = {
    baudRate: 9600,
    dataBits: 8,
    flowControl: false,
    parity: 'none',
    stopBits: 1
};
EASUN.ValueConfig = {
    MainPageLog: {
        address: 57129,
        len: 16,
        rate: 1,
        format: "%a",
        unit: "",
        name: "Main page log"
    },
    SoftwareVersion1: {
        address: 20,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "V",
        name: "Software version 1"
    },
    SoftwareVersion2: {
        address: 21,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "V",
        name: "Software version 2"
    },
    CompileTime: {
        address: 33,
        len: 20,
        rate: 1,
        format: "%s",
        unit: "",
        name: "Compile time"
    },
    ProductSN: {
        address: 53,
        len: 20,
        rate: 1,
        format: "%s",
        unit: "",
        name: "Product SN"
    },
    PowerRate: {
        address: 57624,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "kW",
        name: "Power rate"
    },
    PVStatus: {
        address: 265,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "PV status"
    },
    LineStatus: {
        address: 528,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Line status"
    },
    BatteryStatus: {
        address: 258,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Battery status"
    },
    LoadStatus: {
        address: 539,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Load status"
    },
    CurrentFault: {
        address: 516,
        len: 4,
        maxLen: 31,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Current fault"
    },
    PVVoltage1: {
        address: 263,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "PV voltage1"
    },
    PVCurrent: {
        address: 264,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "A",
        name: "PV current"
    },
    PVPower: {
        address: 265,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "W",
        name: "PV power"
    },
    LineVoltage: {
        address: 531,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Line voltage"
    },
    LineCurrent: {
        address: 532,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "A",
        name: "Line current"
    },
    LineFrequency: {
        address: 533,
        len: 1,
        rate: 0.01,
        format: "%.2f",
        unit: "Hz",
        name: "Line frequency"
    },
    BatteryType: {
        address: 57348,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "User def"
                },
                {
                    no: 1,
                    ename: "SLD"
                },
                {
                    no: 2,
                    ename: "FLD"
                },
                {
                    no: 3,
                    ename: "GEL"
                },
                {
                    no: 4,
                    ename: "LF14"
                },
                {
                    no: 5,
                    ename: "LF15"
                },
                {
                    no: 6,
                    ename: "LF16"
                },
                {
                    no: 7,
                    ename: "LF7"
                },
                {
                    no: 8,
                    ename: "LF8"
                },
                {
                    no: 9,
                    ename: "LF9"
                },
                {
                    no: 10,
                    ename: "NCA7"
                },
                {
                    no: 11,
                    ename: "NCA8"
                },
                {
                    no: 12,
                    ename: "NCA13"
                },
                {
                    no: 13,
                    ename: "NCA14"
                }
            ]
        },
        name: "Battery type"
    },
    BatteryVoltage: {
        address: 257,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Battery voltage"
    },
    BatteryCurrent: {
        address: 258,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "A",
        signed: "S",
        name: "Battery current"
    },
    BatterySOC: {
        address: 256,
        len: 1,
        maxLen: 15,
        rate: 1,
        format: "%d",
        unit: "%",
        name: "Battery SOC(%)"
    },
    ChgCurrentByLine: {
        address: 542,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "A",
        signed: "S",
        name: "Chg current by line"
    },
    LoadVoltage: {
        address: 534,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Load voltage"
    },
    LoadCurrent: {
        address: 537,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "A",
        name: "Load current"
    },
    LoadActivePower: {
        address: 539,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "W",
        name: "Load active power"
    },
    LoadApparentPower: {
        address: 540,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "VA",
        name: "Load apparent power"
    },
    LoadRatio: {
        address: 543,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "%",
        name: "Load ratio"
    },
    TemperatureDC: {
        address: 544,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "℃",
        signed: "S",
        name: "Temperature DC"
    },
    TemperatureAC: {
        address: 545,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "℃",
        signed: "S",
        name: "Temperature AC"
    },
    TemperatureTR: {
        address: 546,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "℃",
        signed: "S",
        name: "Temperature TR"
    },
    InverterCurrent: {
        address: 535,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "A",
        name: "Inverter current"
    },
    InverterFrequency: {
        address: 536,
        len: 1,
        rate: 0.01,
        format: "%.2f",
        unit: "Hz",
        name: "Inverter frequency"
    },
    MachineState: {
        address: 528,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Power on"
                },
                {
                    no: 1,
                    ename: "Stand by"
                },
                {
                    no: 2,
                    ename: "Initialization"
                },
                {
                    no: 3,
                    ename: "Soft start"
                },
                {
                    no: 4,
                    ename: "Running in line"
                },
                {
                    no: 5,
                    ename: "Running in inverter"
                },
                {
                    no: 6,
                    ename: "Invert to line"
                },
                {
                    no: 7,
                    ename: "Line to invert"
                },
                {
                    no: 8,
                    ename: "remain"
                },
                {
                    no: 9,
                    ename: "remain"
                },
                {
                    no: 10,
                    ename: "Shutdown"
                },
                {
                    no: 11,
                    ename: "Fault"
                }
            ]
        },
        name: "Machine state"
    },
    BatteryChargeStep: {
        address: 267,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Not start"
                },
                {
                    no: 1,
                    ename: "Const current"
                },
                {
                    no: 2,
                    ename: "Const voltage"
                },
                {
                    no: 3,
                    ename: "reserved"
                },
                {
                    no: 4,
                    ename: "Float charge"
                },
                {
                    no: 5,
                    ename: "reserved"
                },
                {
                    no: 6,
                    ename: "Active charge"
                },
                {
                    no: 7,
                    ename: "Active charge"
                }
            ]
        },
        name: "Battery charge step"
    },
    OutputPriority: {
        address: 57860,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "PV first"
                },
                {
                    no: 1,
                    ename: "Mains first"
                },
                {
                    no: 2,
                    ename: "Battery first"
                }
            ]
        },
        name: "Output priority"
    },
    PVGenerateEnergyTotal: {
        address: 61496,
        len: 2,
        rate: 0.1,
        format: "%.1f",
        unit: "kWh",
        name: "PV generate energy total"
    },
    LoadConsumEnergyTotal: {
        address: 61498,
        len: 2,
        rate: 0.1,
        format: "%.1f",
        unit: "kWh",
        name: "Load consum energy total"
    },
    PVGenerateEnergyToday: {
        address: 61487,
        len: 1,
        maxLen: 13,
        rate: 0.1,
        format: "%.1f",
        unit: "kWh",
        name: "PV generate energy today"
    },
    LoadConsumEnergyToday: {
        address: 61488,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "kWh",
        name: "Load consum energy today"
    },
    OutputFrequency: {
        address: 57865,
        len: 1,
        rate: 0.01,
        format: "%.2f",
        unit: "Hz",
        name: "Output Frequency",
        sel: {
            item: [
                {
                    no: 50,
                    ename: "50 Hz"
                },
                {
                    no: 60,
                    ename: "60 Hz"
                }
            ]
        }
    },
    AcInputVoltageRange: {
        address: 57867,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Ac Input Voltage Range",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "APL"
                },
                {
                    no: 1,
                    ename: "UPS"
                }
            ]
        }
    },
    TurnToMainsVolt: {
        address: 57371,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Turn to mains volt"
    },
    TurnToInverterVolt: {
        address: 57378,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Turn to inverter volt"
    },
    ChargerSourcePriority: {
        address: 57871,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Charger source priority",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "PV first"
                },
                {
                    no: 1,
                    ename: "Mains first"
                },
                {
                    no: 2,
                    ename: "PV and Mains"
                },
                {
                    no: 3,
                    ename: "Only PV"
                }
            ]
        }
    },
    MaxChargerCurrent: {
        address: 57866,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "A",
        name: "Max charger current"
    },
    BatteryBoostChargeVoltage: {
        address: 57352,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Battery boost charge voltage"
    },
    BatteryBoostChargeTime: {
        address: 57362,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "Min",
        name: "Battery boost charge time"
    },
    BatteryFloatingChargeVoltage: {
        address: 57353,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Battery floating charge voltage"
    },
    BatteryOverDischargeVoltage: {
        address: 57357,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Battery over discharge voltage"
    },
    BatteryOverDischargeDelayTime: {
        address: 57360,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "S",
        name: "Battery over discharge delay time"
    },
    BatteryUnderVoltageAlarm: {
        address: 57356,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Battery under voltage alarm"
    },
    BatteryDischargeLimitVoltage: {
        address: 57358,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Battery discharge limit voltage"
    },
    BatteryEqualizationEnable: {
        address: 57862,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "V",
        name: "Battery equalization enable",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Disable"
                },
                {
                    no: 1,
                    ename: "Enable"
                }
            ]
        }
    },
    BatteryEqualizationVoltage: {
        address: 57351,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Battery equalization voltage"
    },
    BatteryEqualizedTime: {
        address: 57361,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "Min",
        name: "Battery equalized time"
    },
    BatteryEqualizedTimeOut: {
        address: 57379,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "Min",
        name: "Battery equalized time out"
    },
    BatteryEqualizationInterval: {
        address: 57363,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "Day",
        name: "Battery equalization interval"
    },
    BatteryEqualizationImmediately: {
        address: 57101,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Battery equalization immediately",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Disable"
                },
                {
                    no: 1,
                    ename: "Enable"
                }
            ]
        }
    },
    PowerSavingMode: {
        address: 57868,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Power saving mode",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Disable"
                },
                {
                    no: 1,
                    ename: "Enable"
                }
            ]
        }
    },
    RestartWhenOverLoad: {
        address: 57869,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Restart when over load",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Disable"
                },
                {
                    no: 1,
                    ename: "Enable"
                }
            ]
        }
    },
    RestartWhenOverTemperature: {
        address: 57870,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Restart when over temperature",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Disable"
                },
                {
                    no: 1,
                    ename: "Enable"
                }
            ]
        }
    },
    AlarmEnable: {
        address: 57872,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Alarm enable",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Disable"
                },
                {
                    no: 1,
                    ename: "Enable"
                }
            ]
        }
    },
    InputChangeAlarm: {
        address: 57873,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Input change alarm",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Disable"
                },
                {
                    no: 1,
                    ename: "Enable"
                }
            ]
        }
    },
    BypassOutputWhenOverLoad: {
        address: 57874,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Bypass output when over load",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Disable"
                },
                {
                    no: 1,
                    ename: "Enable"
                }
            ]
        }
    },
    MaxACChargerCurrent: {
        address: 57861,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "A",
        name: "Max AC charger current"
    },
    SplitPhase: {
        address: 57876,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Split Phase",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Disable"
                },
                {
                    no: 1,
                    ename: "Enable"
                }
            ]
        }
    },
    RS485Address: {
        address: 57856,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "RS485 Address"
    },
    ParallelMode: {
        address: 57857,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Parallel Mode",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Stand-alone"
                },
                {
                    no: 1,
                    ename: "Parallel-single phase"
                },
                {
                    no: 2,
                    ename: "Parallel-split phase 0°"
                },
                {
                    no: 3,
                    ename: "Parallel-split phase 120°"
                },
                {
                    no: 4,
                    ename: "Parallel-split phase 180°"
                },
                {
                    no: 5,
                    ename: "Parallel-three phase A"
                },
                {
                    no: 6,
                    ename: "Parallel-three phase B"
                },
                {
                    no: 7,
                    ename: "Parallel-three phase C"
                }
            ]
        }
    },
    BMSEnable: {
        address: 57877,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "BMS enable",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Disable"
                },
                {
                    no: 1,
                    ename: "458 BMS"
                },
                {
                    no: 2,
                    ename: "CAN BMS"
                }
            ]
        }
    },
    BMSProtocol: {
        address: 57883,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "BMS Protocol",
        sel: {
            item: [
                {
                    no: 0,
                    ename: "Pace"
                },
                {
                    no: 1,
                    ename: "Rata"
                },
                {
                    no: 2,
                    ename: "Allgrand"
                },
                {
                    no: 3,
                    ename: "Oliter"
                },
                {
                    no: 4,
                    ename: "PCT"
                },
                {
                    no: 5,
                    ename: "Sunwoda"
                },
                {
                    no: 6,
                    ename: "Dyness"
                },
                {
                    no: 7,
                    ename: "WOW"
                },
                {
                    no: 8,
                    ename: "Pylontech"
                },
                {
                    no: 16,
                    ename: "WS Technicals"
                },
                {
                    no: 17,
                    ename: "Uz Energy"
                }
            ]
        }
    },
    Reserved: {
        address: 57620,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "",
        name: "Reserved"
    },
    BatteryUndervoltageRecovery: {
        address: 57355,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Battery undervoltage recovery"
    },
    MaxPVChargerCurrent: {
        address: 57345,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "A",
        name: "Max PV charger current"
    },
    BatteryChargeRecovery: {
        address: 57354,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Battery charge recovery"
    },
    OutputVoltageSet: {
        address: 57864,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "V",
        name: "Output voltage set"
    },
    SystemDateTime: {
        address: 524,
        len: 3,
        rate: 1,
        format: "%zdt",
        unit: "",
        name: "System date time"
    },
    InputPassword: {
        address: 57859,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Input password"
    },
    ChangePassword: {
        address: 57858,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Change password"
    },
    CustomerID: {
        address: 57623,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Customer ID"
    },
    PVVoltageRate: {
        address: 57631,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "V",
        name: "PV voltage rate"
    },
    MaxChargeCurrentByPV: {
        address: 57632,
        len: 1,
        rate: 0.1,
        format: "%.1f",
        unit: "A",
        name: "Max charge current by PV"
    },
    FunctionEnable1: {
        address: 57629,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Function enable 1"
    },
    FunctionEnable2: {
        address: 57630,
        len: 1,
        rate: 1,
        format: "%d",
        unit: "",
        name: "Function enable 2"
    },
};
EASUN.StatsConfig = {
    Total: {
        BatteryChargeTotal: {
            address: 61492,
            len: 2,
            rate: 1,
            maxLen: 8,
            format: "%d",
            unit: "Ah",
            name: "Battery charge total"
        },
        PVGenerateEnergyTotal: {
            address: 61496,
            len: 2,
            rate: 0.1,
            format: "%.1f",
            unit: "kWh",
            name: "PV generate energy total"
        },
        WorkTimeTotalInInverter: {
            address: 61514,
            len: 1,
            rate: 1,
            format: "%d",
            unit: "h",
            name: "Work time total in inverter"
        },
        BatteryDischargeTotal: {
            address: 61494,
            len: 2,
            rate: 1,
            format: "%d",
            unit: "Ah",
            name: "Battery discharge total"
        },
        LoadConsumEnergyTotal: {
            address: 61498,
            len: 2,
            rate: 0.1,
            format: "%.1f",
            unit: "kWh",
            name: "Load consum energy total"
        },
        WorkTimeTotalInLine: {
            address: 61515,
            len: 1,
            rate: 1,
            format: "%d",
            unit: "h",
            name: "Work time total in line"
        },
    },
    Week: {
        PVEnergy: {
            address: 61440,
            len: 7,
            rate: 0.1,
            format: "%.1f",
            unit: "kWh",
            name: "PV energy"
        },
        BatteryChargeEnergy: {
            address: 61447,
            len: 7,
            rate: 1,
            format: "%d",
            unit: "Ah",
            name: "Battery charge energy"
        },
        BatteryDischargeEnergy: {
            address: 61454,
            len: 7,
            rate: 1,
            format: "%d",
            unit: "Ah",
            name: "Battery discharge energy"
        },
        LineChargeEnergy: {
            address: 61461,
            len: 7,
            rate: 1,
            format: "%d",
            unit: "Ah",
            name: "Line charge energy"
        },
        LoadConsumEnergy: {
            address: 61468,
            len: 7,
            rate: 0.1,
            format: "%.1f",
            unit: "kWh",
            name: "Load consum energy"
        },
        LoadConsumEnergyFromLine: {
            address: 61475,
            len: 7,
            rate: 0.1,
            format: "%.1f",
            unit: "kWh",
            name: "Load consum energy from line"
        },
    },
    Day: {
        PVEnergy: {
            address: 61487,
            len: 1,
            rate: 0.1,
            format: "%.1f",
            unit: "kWh",
            name: "PV energy"
        },
        BatteryChargeEnergy: {
            address: 61485,
            len: 1,
            rate: 1,
            format: "%d",
            unit: "Ah",
            name: "Battery charge energy"
        },
        BatteryDischargeEnergy: {
            address: 61486,
            len: 1,
            rate: 1,
            format: "%d",
            unit: "Ah",
            name: "Battery discharge energy"
        },
        LineChargeEnergy: {
            address: 61500,
            len: 1,
            rate: 1,
            format: "%d",
            unit: "Ah",
            name: "Line charge energy"
        },
        LoadConsumEnergy: {
            address: 61488,
            len: 1,
            rate: 0.1,
            format: "%.1f",
            unit: "kWh",
            name: "Load consum energy"
        },
        LoadConsumEnergyFromLine: {
            address: 61501,
            len: 1,
            rate: 0.1,
            format: "%.1f",
            unit: "kWh",
            name: "Load consum energy from line"
        },
    },
};
(function (EASUN) {
    let MachineState;
    (function (MachineState) {
        MachineState[MachineState["PowerOn"] = 0] = "PowerOn";
        MachineState[MachineState["StandBy"] = 1] = "StandBy";
        MachineState[MachineState["Initialization"] = 2] = "Initialization";
        MachineState[MachineState["SoftStart"] = 3] = "SoftStart";
        MachineState[MachineState["RunningInLine"] = 4] = "RunningInLine";
        MachineState[MachineState["RunningInInverter"] = 5] = "RunningInInverter";
        MachineState[MachineState["InvertToLine"] = 6] = "InvertToLine";
        MachineState[MachineState["LineToInvert"] = 7] = "LineToInvert";
        MachineState[MachineState["Remain"] = 8] = "Remain";
        MachineState[MachineState["Remain_"] = 9] = "Remain_";
        MachineState[MachineState["Shutdown"] = 10] = "Shutdown";
        MachineState[MachineState["Fault"] = 11] = "Fault";
    })(MachineState = EASUN.MachineState || (EASUN.MachineState = {}));
    let BatteryChargeStep;
    (function (BatteryChargeStep) {
        BatteryChargeStep[BatteryChargeStep["NotStart"] = 0] = "NotStart";
        BatteryChargeStep[BatteryChargeStep["ConstCurrent"] = 1] = "ConstCurrent";
        BatteryChargeStep[BatteryChargeStep["ConstVoltage"] = 2] = "ConstVoltage";
        BatteryChargeStep[BatteryChargeStep["Reserved1"] = 3] = "Reserved1";
        BatteryChargeStep[BatteryChargeStep["FloatCharge"] = 4] = "FloatCharge";
        BatteryChargeStep[BatteryChargeStep["Reserved2"] = 5] = "Reserved2";
        BatteryChargeStep[BatteryChargeStep["ActiveCharge"] = 6] = "ActiveCharge";
        BatteryChargeStep[BatteryChargeStep["ActiveCharge_"] = 7] = "ActiveCharge_";
    })(BatteryChargeStep = EASUN.BatteryChargeStep || (EASUN.BatteryChargeStep = {}));
    let OutputPriority;
    (function (OutputPriority) {
        OutputPriority[OutputPriority["PVFirst"] = 0] = "PVFirst";
        OutputPriority[OutputPriority["MainsFirst"] = 1] = "MainsFirst";
        OutputPriority[OutputPriority["BatteryFirst"] = 2] = "BatteryFirst";
    })(OutputPriority = EASUN.OutputPriority || (EASUN.OutputPriority = {}));
    let OutputFrequency;
    (function (OutputFrequency) {
        OutputFrequency[OutputFrequency["HZ50"] = 50] = "HZ50";
        OutputFrequency[OutputFrequency["HZ60"] = 60] = "HZ60";
    })(OutputFrequency = EASUN.OutputFrequency || (EASUN.OutputFrequency = {}));
    let AcInputVoltageRange;
    (function (AcInputVoltageRange) {
        AcInputVoltageRange[AcInputVoltageRange["APL"] = 0] = "APL";
        AcInputVoltageRange[AcInputVoltageRange["UPS"] = 1] = "UPS";
    })(AcInputVoltageRange = EASUN.AcInputVoltageRange || (EASUN.AcInputVoltageRange = {}));
    let ChargerSourcePriority;
    (function (ChargerSourcePriority) {
        ChargerSourcePriority[ChargerSourcePriority["PVFirst"] = 0] = "PVFirst";
        ChargerSourcePriority[ChargerSourcePriority["MainsFirst"] = 1] = "MainsFirst";
        ChargerSourcePriority[ChargerSourcePriority["PVAndMains"] = 2] = "PVAndMains";
        ChargerSourcePriority[ChargerSourcePriority["OnlyPV"] = 3] = "OnlyPV";
    })(ChargerSourcePriority = EASUN.ChargerSourcePriority || (EASUN.ChargerSourcePriority = {}));
    let BatteryType;
    (function (BatteryType) {
        BatteryType[BatteryType["UserDefined"] = 0] = "UserDefined";
        BatteryType[BatteryType["SLD"] = 1] = "SLD";
        BatteryType[BatteryType["FLD"] = 2] = "FLD";
        BatteryType[BatteryType["GEL"] = 3] = "GEL";
        BatteryType[BatteryType["LiFePoX14"] = 4] = "LiFePoX14";
        BatteryType[BatteryType["LiFePoX15"] = 5] = "LiFePoX15";
        BatteryType[BatteryType["LiFePoX16"] = 6] = "LiFePoX16";
        BatteryType[BatteryType["LiFePoX7"] = 7] = "LiFePoX7";
        BatteryType[BatteryType["LiFePoX8"] = 8] = "LiFePoX8";
        BatteryType[BatteryType["LiFePoX9"] = 9] = "LiFePoX9";
        BatteryType[BatteryType["TernaryLiX7"] = 10] = "TernaryLiX7";
        BatteryType[BatteryType["TernaryLiX8"] = 11] = "TernaryLiX8";
        BatteryType[BatteryType["TernaryLiX13"] = 12] = "TernaryLiX13";
        BatteryType[BatteryType["TernaryLiX14"] = 13] = "TernaryLiX14";
    })(BatteryType = EASUN.BatteryType || (EASUN.BatteryType = {}));
    let BatteryEqualizationEnable;
    (function (BatteryEqualizationEnable) {
        BatteryEqualizationEnable[BatteryEqualizationEnable["Disable"] = 0] = "Disable";
        BatteryEqualizationEnable[BatteryEqualizationEnable["Enable"] = 1] = "Enable";
    })(BatteryEqualizationEnable = EASUN.BatteryEqualizationEnable || (EASUN.BatteryEqualizationEnable = {}));
    let BatteryEqualizationImmediately;
    (function (BatteryEqualizationImmediately) {
        BatteryEqualizationImmediately[BatteryEqualizationImmediately["Disable"] = 0] = "Disable";
        BatteryEqualizationImmediately[BatteryEqualizationImmediately["Enable"] = 1] = "Enable";
    })(BatteryEqualizationImmediately = EASUN.BatteryEqualizationImmediately || (EASUN.BatteryEqualizationImmediately = {}));
    let PowerSavingMode;
    (function (PowerSavingMode) {
        PowerSavingMode[PowerSavingMode["Disable"] = 0] = "Disable";
        PowerSavingMode[PowerSavingMode["Enable"] = 1] = "Enable";
    })(PowerSavingMode = EASUN.PowerSavingMode || (EASUN.PowerSavingMode = {}));
    let RestartWhenOverLoad;
    (function (RestartWhenOverLoad) {
        RestartWhenOverLoad[RestartWhenOverLoad["Disable"] = 0] = "Disable";
        RestartWhenOverLoad[RestartWhenOverLoad["Enable"] = 1] = "Enable";
    })(RestartWhenOverLoad = EASUN.RestartWhenOverLoad || (EASUN.RestartWhenOverLoad = {}));
    let RestartWhenOverTemperature;
    (function (RestartWhenOverTemperature) {
        RestartWhenOverTemperature[RestartWhenOverTemperature["Disable"] = 0] = "Disable";
        RestartWhenOverTemperature[RestartWhenOverTemperature["Enable"] = 1] = "Enable";
    })(RestartWhenOverTemperature = EASUN.RestartWhenOverTemperature || (EASUN.RestartWhenOverTemperature = {}));
    let AlarmEnable;
    (function (AlarmEnable) {
        AlarmEnable[AlarmEnable["Disable"] = 0] = "Disable";
        AlarmEnable[AlarmEnable["Enable"] = 1] = "Enable";
    })(AlarmEnable = EASUN.AlarmEnable || (EASUN.AlarmEnable = {}));
    let InputChangeAlarm;
    (function (InputChangeAlarm) {
        InputChangeAlarm[InputChangeAlarm["Disable"] = 0] = "Disable";
        InputChangeAlarm[InputChangeAlarm["Enable"] = 1] = "Enable";
    })(InputChangeAlarm = EASUN.InputChangeAlarm || (EASUN.InputChangeAlarm = {}));
    let BypassOutputWhenOverLoad;
    (function (BypassOutputWhenOverLoad) {
        BypassOutputWhenOverLoad[BypassOutputWhenOverLoad["Disable"] = 0] = "Disable";
        BypassOutputWhenOverLoad[BypassOutputWhenOverLoad["Enable"] = 1] = "Enable";
    })(BypassOutputWhenOverLoad = EASUN.BypassOutputWhenOverLoad || (EASUN.BypassOutputWhenOverLoad = {}));
    let SplitPhase;
    (function (SplitPhase) {
        SplitPhase[SplitPhase["Disable"] = 0] = "Disable";
        SplitPhase[SplitPhase["Enable"] = 1] = "Enable";
    })(SplitPhase = EASUN.SplitPhase || (EASUN.SplitPhase = {}));
    let ParallelMode;
    (function (ParallelMode) {
        ParallelMode[ParallelMode["StandAlone"] = 0] = "StandAlone";
        ParallelMode[ParallelMode["ParallelSinglePhase"] = 1] = "ParallelSinglePhase";
        ParallelMode[ParallelMode["ParallelSplitPhase0deg"] = 2] = "ParallelSplitPhase0deg";
        ParallelMode[ParallelMode["ParallelSplitPhase120deg"] = 3] = "ParallelSplitPhase120deg";
        ParallelMode[ParallelMode["ParallelSplitPhase180deg"] = 4] = "ParallelSplitPhase180deg";
        ParallelMode[ParallelMode["ParallelThreePhaseA"] = 5] = "ParallelThreePhaseA";
        ParallelMode[ParallelMode["ParallelThreePhaseB"] = 6] = "ParallelThreePhaseB";
        ParallelMode[ParallelMode["ParallelThreePhaseC"] = 7] = "ParallelThreePhaseC";
    })(ParallelMode = EASUN.ParallelMode || (EASUN.ParallelMode = {}));
    let BMSEnable;
    (function (BMSEnable) {
        BMSEnable[BMSEnable["Disable"] = 0] = "Disable";
        BMSEnable[BMSEnable["BMS458"] = 1] = "BMS458";
        BMSEnable[BMSEnable["BMSCAN"] = 2] = "BMSCAN";
    })(BMSEnable = EASUN.BMSEnable || (EASUN.BMSEnable = {}));
    let BMSProtocol;
    (function (BMSProtocol) {
        BMSProtocol[BMSProtocol["Pace"] = 0] = "Pace";
        BMSProtocol[BMSProtocol["Rata"] = 1] = "Rata";
        BMSProtocol[BMSProtocol["Allgrand"] = 2] = "Allgrand";
        BMSProtocol[BMSProtocol["Oliter"] = 3] = "Oliter";
        BMSProtocol[BMSProtocol["PCT"] = 4] = "PCT";
        BMSProtocol[BMSProtocol["Sunwoda"] = 5] = "Sunwoda";
        BMSProtocol[BMSProtocol["Dyness"] = 6] = "Dyness";
        BMSProtocol[BMSProtocol["WOW"] = 7] = "WOW";
        BMSProtocol[BMSProtocol["Pylontech"] = 8] = "Pylontech";
        BMSProtocol[BMSProtocol["WSTechnicals"] = 16] = "WSTechnicals";
        BMSProtocol[BMSProtocol["UzEnergy"] = 17] = "UzEnergy";
    })(BMSProtocol = EASUN.BMSProtocol || (EASUN.BMSProtocol = {}));
})(EASUN = exports.EASUN || (exports.EASUN = {}));
exports.default = EASUN;
