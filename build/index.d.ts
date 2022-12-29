import { WriteRegisterResult, SerialPortOptions } from "modbus-serial/ModbusRTU";
interface AddressConfig {
    name: string;
    address: number;
    len: number;
    maxLen?: number;
    rate: number;
    format: string;
    unit: string;
    signed?: "S";
    sel?: {
        item: Array<{
            no: number;
            ename: string | number;
        }>;
    };
}
export declare class EASUN {
    private port;
    private options;
    private static MODBUSID;
    private static MINWAIT;
    private static DEFAULT_TIMEOUT;
    private static DEFAULT_OPTIONS;
    private client;
    private lastOp;
    private static sleep;
    constructor(port: string, options?: SerialPortOptions);
    connect(): Promise<void>;
    get timeout(): number;
    set timeout(value: number);
    private _readAddress;
    private _readNumber;
    private _readString;
    static formatNumber(num: number, config: AddressConfig): string;
    static formatDateValue(values: Array<number>): Date | void;
    writeNumber(config: AddressConfig, value: number): Promise<WriteRegisterResult | void>;
    static ValueConfig: {
        [name: string]: AddressConfig;
    };
    static StatsConfig: {
        [group: string]: {
            [name: string]: AddressConfig;
        };
    };
    private _getNumberValue;
    /** Information */
    getSoftwareVersion1(): Promise<number | void>;
    getSoftwareVersion2(): Promise<number | void>;
    getCompileTime(): Promise<string | void>;
    getProductSN(): Promise<string | void>;
    getPowerRate(format?: false): Promise<number | void>;
    getPowerRate(format?: true): Promise<string | void>;
    getPVVoltageRate(format?: false): Promise<number | void>;
    getPVVoltageRate(format?: true): Promise<string | void>;
    getPVStatus(): Promise<number | void>;
    getLineStatus(): Promise<number | void>;
    getBatteryStatus(): Promise<number | void>;
    getLoadStatus(): Promise<number | void>;
    getPVVoltage1(format?: false): Promise<number | void>;
    getPVVoltage1(format?: true): Promise<string | void>;
    getPVCurrent(format?: false): Promise<number | void>;
    getPVCurrent(format?: true): Promise<string | void>;
    getPVPower(format?: false): Promise<number | void>;
    getPVPower(format?: true): Promise<string | void>;
    getLineVoltage(format?: false): Promise<number | void>;
    getLineVoltage(format?: true): Promise<string | void>;
    getLineCurrent(format?: false): Promise<number | void>;
    getLineCurrent(format?: true): Promise<string | void>;
    getLineFrequency(format?: false): Promise<number | void>;
    getLineFrequency(format?: true): Promise<string | void>;
    getBatteryType(format?: false): Promise<number | void>;
    getBatteryType(format?: true): Promise<string | void>;
    getBatteryVoltage(format?: false): Promise<number | void>;
    getBatteryVoltage(format?: true): Promise<string | void>;
    getBatteryCurrent(format?: false): Promise<number | void>;
    getBatteryCurrent(format?: true): Promise<string | void>;
    getBatterySOC(format?: false): Promise<number | void>;
    getBatterySOC(format?: true): Promise<string | void>;
    getChgCurrentByLine(format?: false): Promise<number | void>;
    getChgCurrentByLine(format?: true): Promise<string | void>;
    getLoadVoltage(format?: false): Promise<number | void>;
    getLoadVoltage(format?: true): Promise<string | void>;
    getLoadCurrent(format?: false): Promise<number | void>;
    getLoadCurrent(format?: true): Promise<string | void>;
    getLoadActivePower(format?: false): Promise<number | void>;
    getLoadActivePower(format?: true): Promise<string | void>;
    getLoadApparentPower(format?: false): Promise<number | void>;
    getLoadApparentPower(format?: true): Promise<string | void>;
    getLoadRatio(format?: false): Promise<number | void>;
    getLoadRatio(format?: true): Promise<string | void>;
    getTemperatureDC(format?: false): Promise<number | void>;
    getTemperatureDC(format?: true): Promise<string | void>;
    getTemperatureAC(format?: false): Promise<number | void>;
    getTemperatureAC(format?: true): Promise<string | void>;
    getTemperatureTR(format?: false): Promise<number | void>;
    getTemperatureTR(format?: true): Promise<string | void>;
    getInverterCurrent(format?: false): Promise<number | void>;
    getInverterCurrent(format?: true): Promise<string | void>;
    getInverterFrequency(format?: false): Promise<number | void>;
    getInverterFrequency(format?: true): Promise<string | void>;
    getMachineState(): Promise<EASUN.MachineState | void>;
    getBatteryChargeStep(): Promise<EASUN.BatteryChargeStep | void>;
    getOutputPriority(): Promise<EASUN.OutputPriority | void>;
    getPVGenerateEnergyTotal(format?: false): Promise<number | void>;
    getPVGenerateEnergyTotal(format?: true): Promise<string | void>;
    getLoadConsumEnergyTotal(format?: false): Promise<number | void>;
    getLoadConsumEnergyTotal(format?: true): Promise<string | void>;
    getPVGenerateEnergyToday(format?: false): Promise<number | void>;
    getPVGenerateEnergyToday(format?: true): Promise<string | void>;
    getLoadConsumEnergyToday(format?: false): Promise<number | void>;
    getLoadConsumEnergyToday(format?: true): Promise<string | void>;
    /** Parameters */
    setOutputPriority(value: EASUN.OutputPriority): Promise<EASUN.OutputPriority | void>;
    getOutputFrequency(format?: false): Promise<EASUN.OutputFrequency | void>;
    getOutputFrequency(format?: true): Promise<string | void>;
    setOutputFrequency(value: EASUN.OutputFrequency): Promise<EASUN.OutputFrequency | void>;
    getAcInputVoltageRange(format?: false): Promise<EASUN.AcInputVoltageRange | void>;
    getAcInputVoltageRange(format?: true): Promise<string | void>;
    setAcInputVoltageRange(value: EASUN.AcInputVoltageRange): Promise<EASUN.AcInputVoltageRange | void>;
    getTurnToMainsVolt(format?: false): Promise<number | void>;
    getTurnToMainsVolt(format?: true): Promise<string | void>;
    setTurnToMainsVolt(value: number): Promise<number | void>;
    getTurnToInverterVolt(format?: false): Promise<number | void>;
    getTurnToInverterVolt(format?: true): Promise<string | void>;
    setTurnToInverterVolt(value: number): Promise<number | void>;
    getChargerSourcePriority(): Promise<EASUN.ChargerSourcePriority | void>;
    setChargerSourcePriority(value: EASUN.ChargerSourcePriority): Promise<EASUN.ChargerSourcePriority | void>;
    getMaxChargerCurrent(format?: false): Promise<number | void>;
    getMaxChargerCurrent(format?: true): Promise<string | void>;
    setMaxChargerCurrent(value: number): Promise<number | void>;
    setBatteryType(value: EASUN.BatteryType): Promise<EASUN.BatteryType | void>;
    getBatteryBoostChargeVoltage(format?: false): Promise<number | void>;
    getBatteryBoostChargeVoltage(format?: true): Promise<string | void>;
    setBatteryBoostChargeVoltage(value: number): Promise<number | void>;
    getBatteryBoostChargeTime(format?: false): Promise<number | void>;
    getBatteryBoostChargeTime(format?: true): Promise<string | void>;
    setBatteryBoostChargeTime(value: number): Promise<number | void>;
    getBatteryFloatingChargeVoltage(format?: false): Promise<number | void>;
    getBatteryFloatingChargeVoltage(format?: true): Promise<string | void>;
    setBatteryFloatingChargeVoltage(value: number): Promise<number | void>;
    getBatteryOverDischargeVoltage(format?: false): Promise<number | void>;
    getBatteryOverDischargeVoltage(format?: true): Promise<string | void>;
    setBatteryOverDischargeVoltage(value: number): Promise<number | void>;
    getBatteryOverDischargeDelayTime(format?: false): Promise<number | void>;
    getBatteryOverDischargeDelayTime(format?: true): Promise<string | void>;
    setBatteryOverDischargeDelayTime(value: number): Promise<number | void>;
    getBatteryUnderVoltageAlarm(format?: false): Promise<number | void>;
    getBatteryUnderVoltageAlarm(format?: true): Promise<string | void>;
    setBatteryUnderVoltageAlarm(value: number): Promise<number | void>;
    getBatteryDischargeLimitVoltage(format?: false): Promise<number | void>;
    getBatteryDischargeLimitVoltage(format?: true): Promise<string | void>;
    setBatteryDischargeLimitVoltage(value: number): Promise<number | void>;
    getBatteryEqualizationEnable(format?: false): Promise<number | void>;
    getBatteryEqualizationEnable(format?: true): Promise<string | void>;
    setBatteryEqualizationEnable(value: EASUN.BatteryEqualizationEnable): Promise<EASUN.BatteryEqualizationEnable | void>;
    getBatteryEqualizationVoltage(format?: false): Promise<number | void>;
    getBatteryEqualizationVoltage(format?: true): Promise<string | void>;
    setBatteryEqualizationVoltage(value: number): Promise<number | void>;
    getBatteryEqualizedTime(format?: false): Promise<number | void>;
    getBatteryEqualizedTime(format?: true): Promise<string | void>;
    setBatteryEqualizedTime(value: number): Promise<number | void>;
    getBatteryEqualizedTimeOut(format?: false): Promise<number | void>;
    getBatteryEqualizedTimeOut(format?: true): Promise<string | void>;
    setBatteryEqualizedTimeOut(value: number): Promise<number | void>;
    getBatteryEqualizationInterval(format?: false): Promise<number | void>;
    getBatteryEqualizationInterval(format?: true): Promise<string | void>;
    setBatteryEqualizationInterval(value: number): Promise<number | void>;
    getBatteryEqualizationImmediately(): Promise<EASUN.BatteryEqualizationImmediately | void>;
    setBatteryEqualizationImmediately(value: EASUN.BatteryEqualizationImmediately): Promise<EASUN.BatteryEqualizationImmediately | void>;
    getPowerSavingMode(): Promise<EASUN.PowerSavingMode | void>;
    setPowerSavingMode(value: EASUN.PowerSavingMode): Promise<EASUN.PowerSavingMode | void>;
    getRestartWhenOverLoad(): Promise<EASUN.RestartWhenOverLoad | void>;
    setRestartWhenOverLoad(value: EASUN.RestartWhenOverLoad): Promise<EASUN.RestartWhenOverLoad | void>;
    getRestartWhenOverTemperature(): Promise<EASUN.RestartWhenOverTemperature | void>;
    setRestartWhenOverTemperature(value: EASUN.RestartWhenOverTemperature): Promise<EASUN.RestartWhenOverTemperature | void>;
    getAlarmEnable(): Promise<EASUN.AlarmEnable | void>;
    setAlarmEnable(value: EASUN.AlarmEnable): Promise<EASUN.AlarmEnable | void>;
    getInputChangeAlarm(): Promise<EASUN.InputChangeAlarm | void>;
    setInputChangeAlarm(value: EASUN.InputChangeAlarm): Promise<EASUN.InputChangeAlarm | void>;
    getBypassOutputWhenOverLoad(): Promise<EASUN.BypassOutputWhenOverLoad | void>;
    setBypassOutputWhenOverLoad(value: EASUN.BypassOutputWhenOverLoad): Promise<EASUN.BypassOutputWhenOverLoad | void>;
    getMaxACChargerCurrent(format?: false): Promise<number | void>;
    getMaxACChargerCurrent(format?: true): Promise<string | void>;
    setMaxACChargerCurrent(value: number): Promise<number | void>;
    getSplitPhase(): Promise<EASUN.BypassOutputWhenOverLoad | void>;
    setSplitPhase(value: EASUN.SplitPhase): Promise<EASUN.SplitPhase | void>;
    getRS485Address(format?: boolean): Promise<number | string | void>;
    setRS485Address(value: number): Promise<number | void>;
    getParallelMode(): Promise<EASUN.ParallelMode | void>;
    setParallelMode(value: EASUN.ParallelMode): Promise<EASUN.ParallelMode | void>;
    getBMSEnable(): Promise<EASUN.BMSEnable | void>;
    setBMSEnable(value: EASUN.BMSEnable): Promise<EASUN.BMSEnable | void>;
    getBMSProtocol(): Promise<EASUN.BMSProtocol | void>;
    setBMSProtocol(value: EASUN.BMSProtocol): Promise<EASUN.BMSProtocol | void>;
    getReserved(): Promise<number | void>;
    setReserved(value: number): Promise<number | void>;
    getBatteryUndervoltageRecovery(format?: false): Promise<number | void>;
    getBatteryUndervoltageRecovery(format?: true): Promise<string | void>;
    setBatteryUndervoltageRecovery(value: number): Promise<number | void>;
    getMaxPVChargerCurrent(format?: false): Promise<number | void>;
    getMaxPVChargerCurrent(format?: true): Promise<string | void>;
    setMaxPVChargerCurrent(value: number): Promise<number | void>;
    getBatteryChargeRecovery(format?: false): Promise<number | void>;
    getBatteryChargeRecovery(format?: true): Promise<string | void>;
    setBatteryChargeRecovery(value: number): Promise<number | void>;
    getOutputVoltageSet(format?: false): Promise<number | void>;
    getOutputVoltageSet(format?: true): Promise<string | void>;
    setOutputVoltageSet(value: number): Promise<number | void>;
    getSystemDateTime(format?: false): Promise<Array<number> | void>;
    getSystemDateTime(format?: true): Promise<Date | void>;
    /**
     * @returns How many bytes (registers?) were written. Should be 6 (3?)
     */
    setSystemDateTime(value: Array<number>): Promise<number | void>;
    setSystemDateTime(value: Date): Promise<number | void>;
    getInputPassword(): Promise<number | void>;
    setInputPassword(value: number): Promise<number | void>;
    getChangePassword(): Promise<number | void>;
    setChangePassword(value: number): Promise<number | void>;
    getCustomerID(): Promise<number | void>;
    setCustomerID(value: number): Promise<number | void>;
    getMaxChargeCurrentByPV(format?: false): Promise<number | void>;
    getMaxChargeCurrentByPV(format?: true): Promise<string | void>;
    setMaxChargeCurrentByPV(value: number): Promise<number | void>;
    getFunctionEnable1(): Promise<number | void>;
    setFunctionEnable1(value: number): Promise<number | void>;
    getFunctionEnable2(): Promise<number | void>;
    setFunctionEnable2(value: number): Promise<number | void>;
    /** Statistics **/
    getStats_BatteryChargeTotal(format?: false): Promise<number | void>;
    getStats_BatteryChargeTotal(format?: true): Promise<string | void>;
    getStats_PVGenerateEnergyTotal(format?: false): Promise<number | void>;
    getStats_PVGenerateEnergyTotal(format?: true): Promise<string | void>;
    getStats_WorkTimeTotalInInverter(format?: false): Promise<number | void>;
    getStats_WorkTimeTotalInInverter(format?: true): Promise<string | void>;
    getStats_BatteryDischargeTotal(format?: false): Promise<number | void>;
    getStats_BatteryDischargeTotal(format?: true): Promise<string | void>;
    getStats_LoadConsumEnergyTotal(format?: false): Promise<number | void>;
    getStats_LoadConsumEnergyTotal(format?: true): Promise<string | void>;
    getStats_WorkTimeTotalInLine(format?: false): Promise<number | void>;
    getStats_WorkTimeTotalInLine(format?: true): Promise<string | void>;
    private _getStatsWeekValue;
    getStatsWeek_PVEnergy(format?: false): Promise<Array<number> | void>;
    getStatsWeek_PVEnergy(format?: true): Promise<Array<string> | void>;
    getStatsWeek_BatteryChargeEnergy(format?: false): Promise<Array<number> | void>;
    getStatsWeek_BatteryChargeEnergy(format?: true): Promise<Array<string> | void>;
    getStatsWeek_BatteryDischargeEnergy(format?: false): Promise<Array<number> | void>;
    getStatsWeek_BatteryDischargeEnergy(format?: true): Promise<Array<string> | void>;
    getStatsWeek_LineChargeEnergy(format?: false): Promise<Array<number> | void>;
    getStatsWeek_LineChargeEnergy(format?: true): Promise<Array<string> | void>;
    getStatsWeek_LoadConsumEnergy(format?: false): Promise<Array<number> | void>;
    getStatsWeek_LoadConsumEnergy(format?: true): Promise<Array<string> | void>;
    getStatsWeek_LoadConsumEnergyFromLine(format?: false): Promise<Array<number> | void>;
    getStatsWeek_LoadConsumEnergyFromLine(format?: true): Promise<Array<string> | void>;
    getStatsDay_PVEnergy(format?: false): Promise<number | void>;
    getStatsDay_PVEnergy(format?: true): Promise<string | void>;
    getStatsDay_BatteryChargeEnergy(format?: false): Promise<number | void>;
    getStatsDay_BatteryChargeEnergy(format?: true): Promise<string | void>;
    getStatsDay_BatteryDischargeEnergy(format?: false): Promise<number | void>;
    getStatsDay_BatteryDischargeEnergy(format?: true): Promise<string | void>;
    getStatsDay_LineChargeEnergy(format?: false): Promise<number | void>;
    getStatsDay_LineChargeEnergy(format?: true): Promise<string | void>;
    getStatsDay_LoadConsumEnergy(format?: false): Promise<number | void>;
    getStatsDay_LoadConsumEnergy(format?: true): Promise<string | void>;
    getStatsDay_LoadConsumEnergyFromLine(format?: false): Promise<number | void>;
    getStatsDay_LoadConsumEnergyFromLine(format?: true): Promise<string | void>;
}
export declare namespace EASUN {
    enum MachineState {
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
    enum BatteryChargeStep {
        NotStart = 0,
        ConstCurrent = 1,
        ConstVoltage = 2,
        Reserved1 = 3,
        FloatCharge = 4,
        Reserved2 = 5,
        ActiveCharge = 6,
        ActiveCharge_ = 7
    }
    enum OutputPriority {
        PVFirst = 0,
        MainsFirst = 1,
        BatteryFirst = 2
    }
    enum OutputFrequency {
        HZ50 = 50,
        HZ60 = 60
    }
    enum AcInputVoltageRange {
        APL = 0,
        UPS = 1
    }
    enum ChargerSourcePriority {
        PVFirst = 0,
        MainsFirst = 1,
        PVAndMains = 2,
        OnlyPV = 3
    }
    enum BatteryType {
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
    enum BatteryEqualizationEnable {
        Disable = 0,
        Enable = 1
    }
    enum BatteryEqualizationImmediately {
        Disable = 0,
        Enable = 1
    }
    enum PowerSavingMode {
        Disable = 0,
        Enable = 1
    }
    enum RestartWhenOverLoad {
        Disable = 0,
        Enable = 1
    }
    enum RestartWhenOverTemperature {
        Disable = 0,
        Enable = 1
    }
    enum AlarmEnable {
        Disable = 0,
        Enable = 1
    }
    enum InputChangeAlarm {
        Disable = 0,
        Enable = 1
    }
    enum BypassOutputWhenOverLoad {
        Disable = 0,
        Enable = 1
    }
    enum SplitPhase {
        Disable = 0,
        Enable = 1
    }
    enum ParallelMode {
        StandAlone = 0,
        ParallelSinglePhase = 1,
        ParallelSplitPhase0deg = 2,
        ParallelSplitPhase120deg = 3,
        ParallelSplitPhase180deg = 4,
        ParallelThreePhaseA = 5,
        ParallelThreePhaseB = 6,
        ParallelThreePhaseC = 7
    }
    enum BMSEnable {
        Disable = 0,
        BMS458 = 1,
        BMSCAN = 2
    }
    enum BMSProtocol {
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
export default EASUN;
