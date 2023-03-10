## easun-modbus

Node.js library to communicate with an EASUN inverter via a serial connection.
Tested with an EASUN ISolar SMX II 3.6KW, connected via USB to a Raspberry Pi 3B.

### Instalation

`npm install --save easun-modbus`
or
`yarn add easun-modbus`

#### Basic usage

```ts
import EASUN from "easun-modbus";

async function doStuff() {
  const easun = new EASUN("/dev/ttyUSB0");
  await easun.connect();

  // Check the state of charge of the battery
  const battery = await easun.getBatterySOC();
  console.log(
    `Battery is charged to ${battery}${EASUN.ValueConfig.BatterySOC.unit}`
  );

  // Get the total amount of energy used by the load on the device, formatted
  // with the appropriate units
  console.log(await easun.getStats_LoadConsumEnergyTotal(true));

  // Alternatively you can obtain the units directly. For example:
  const freq = await easun.getOutputFrequency();
  console.log(
    `Output frequency is ${freq}${EASUN.ValueConfig.OutputFrequency.unit}`
  );

  // Change the output priority to battery first
  await easun.setOutputPriority(EASUN.OutputPriority.BatteryFirst);

  // If today is Monday, tell the device to only charge the batteries using PV power.
  // Otherwise, use PV and mains.
  if (new Date().getDate() === 1) {
    await easun.setChargerSourcePriority(EASUN.ChargerSourcePriority.OnlyPV);
  } else {
    await easun.setChargerSourcePriority(
      EASUN.ChargerSourcePriority.PVAndMains
    );
  }
}
```

### Documentation

Auto-generated documentation with all the class methods: https://jsayol.github.io/easun-modbus/classes/EASUN-1.html
