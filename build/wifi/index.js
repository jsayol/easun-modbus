"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEasunWifiConnection = void 0;
const net_1 = __importDefault(require("net"));
const dgram_1 = __importDefault(require("dgram"));
const mock_serialport_1 = require("./mock-serialport");
const PORT_LOCAL = 8899;
const PORT_WIFI = 58899;
const TIMEOUT = 5000; // 5s
const KEEPALIVE = 30000; // 30s
let easunWifiSocket;
let udpSocket;
let tcpModbusCounter = 1;
let waitTimeout;
let keepaliveInterval;
function setupEasunWifiServer(wifiIP, localIP) {
    return new Promise((resolve, reject) => {
        createServer(wifiIP, localIP, resolve, reject);
    });
}
function createServer(wifiIP, localIP, resolve, reject) {
    const server = net_1.default.createServer(socket => {
        clearTimeout(waitTimeout);
        easunWifiSocket = socket;
        resolve();
        //Log when a client connnects.
        console.log("[TCP][CLIENT]", `${socket.remoteAddress}:${socket.remotePort} Connected`);
        keepaliveInterval = setInterval(() => {
            // This sends a request for the Wifi ID. Just a dummy request to keep the connection open.
            socket.write(Buffer.from([0x00, 0x00, 0x00, 0x01, 0x00, 0x0a, 0xff, 0x01, 0x16, 0x0b, 0x0a, 0x16, 0x10, 0x2d, 0x01, 0x2c]));
        }, KEEPALIVE);
        //Handle the client data.
        socket.on('data', function (data) {
            //Log data received from the client
            console.log("[TCP][DATA]", data);
        });
        //Handle when client connection is closed
        socket.on('close', function () {
            console.log("[TCP][CLOSE]", `Connection ${socket.remoteAddress}:${socket.remotePort}`);
            // If the connection gets closed, reconnect
            tcpModbusCounter = 1;
            sendUDPConnectCommand(wifiIP, localIP, reject);
        });
        //Handle Client connection error.
        socket.on('error', function (error) {
            console.log("[TCP][ERROR]", `Connection ${socket.remoteAddress}:${socket.remotePort}`, error);
        });
    });
    server.listen(PORT_LOCAL, localIP, async () => {
        console.log("[TCP]", `Server started on port ${PORT_LOCAL}`);
        udpSocket = dgram_1.default.createSocket('udp4');
        udpSocket.on('listening', function () {
            var address = udpSocket.address();
            console.log("[UDP][LISTENING]", 'on ' + address.address + ":" + address.port);
        });
        udpSocket.on('error', (err) => {
            console.log("[UDP][ERROR]", err.stack);
            udpSocket.close();
        });
        udpSocket.on('message', function (message, remote) {
            console.log("[UDP][DATA]", remote.address + ':' + remote.port + ' - ' + message);
        });
        await sendUDPConnectCommand(wifiIP, localIP, reject);
        // setTimeout(() => {
        //     const wifiIDcommand = Uint8Array.from([0xaa, 0xaa, 0x00, 0x01, 0x00, 0x0a, 0xff, 0x04, 0xff, 0x03, 0xe2, 0x04, 0x00, 0x01, 0xe6, 0x6d]);
        //     sendUDP(udpSocket, wifiIDcommand);
        // }, 1000);
    });
}
async function sendUDPConnectCommand(wifiIP, localIP, reject) {
    const command = `set>server=${localIP}:${PORT_LOCAL};`;
    try {
        waitTimeout = setTimeout(() => {
            reject(new Error("Timeout while waiting for WiFi device to connect"));
        }, TIMEOUT);
        await sendUDP(command, wifiIP);
    }
    catch (err) {
        console.error("[UDP][SEND ERROR]", err);
    }
}
async function sendUDP(data, address) {
    return new Promise((resolve, reject) => {
        console.log("[UDP][SEND]", data);
        if (!udpSocket || !(udpSocket instanceof dgram_1.default.Socket)) {
            reject(new Error("No valid UDP socket"));
            return;
        }
        udpSocket.send(data, 0, data.length, PORT_WIFI, address, (err, bytes) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(bytes);
            }
        });
    });
}
/*
export async function setupEasunWifiConnection_old(wifiIP: string, localIP: string): Promise<net.Socket> {
    await setupEasunWifiServer(wifiIP, localIP);

    const mockSocket = new MockTCPSocket();

    mockSocket.on("write", async (data) => {
        console.log("[ON WRITE]", data)
        if (typeof data === "string") {
            data = Buffer.from(data);
        }

        // We need to prepend 0xAAAA before sending it to the WiFi device
        // await sendUDP(Buffer.concat([Buffer.from([0xAA, 0xAA]), data]), wifiIP);

        // We need to prepend the 2-byte incrementing counter of modbus commands
        const counterBuffer = Buffer.alloc(2);
        counterBuffer.writeUint16BE(tcpModbusCounter++);

        const dataSend = Buffer.concat([counterBuffer, data]);
        console.log("[EASUN-WRITE]", dataSend);

        // 00 01 00 01 00 0a ff 04 ff 03

        // const dataSend = Buffer.from("00010001000aff01160b0a16102d012c", "hex");
        // console.log("[EASUN-WRITE]", dataSend);

        easunWifiSocket.write(dataSend, err => {
            if (err) {
                console.error("[EASUN-WRITE][ERROR]", err);
            }
        });
    });

    easunWifiSocket.on("data", data => {
        mockSocket.forwardData(data);
    });

    return mockSocket;
}
*/
async function setupEasunWifiConnection(wifiIP, localIP) {
    await setupEasunWifiServer(wifiIP, localIP);
    mock_serialport_1.instance.on("write", async (data) => {
        console.log("[ON WRITE]", data);
        if (typeof data === "string") {
            data = Buffer.from(data);
        }
        const counterBuffer = Buffer.alloc(2);
        counterBuffer.writeUint16BE(tcpModbusCounter);
        if (tcpModbusCounter >= 0xFFF0) {
            // Let's prevent the counter from going over 0xFFFF.
            // We reset at 0xFFF0 to have some leway.
            tcpModbusCounter = 1;
        }
        else {
            tcpModbusCounter += 1;
        }
        const prefix = Uint8Array.from([0x00, 0x01, 0x00, 0x0a, 0xff, 0x04]);
        const dataSend = Buffer.concat([counterBuffer, prefix, data]);
        console.log("[EASUN-WRITE]", dataSend);
        easunWifiSocket.write(dataSend, err => {
            if (err) {
                console.error("[EASUN-WRITE][ERROR]", err);
            }
        });
    });
    easunWifiSocket.on("data", data => {
        const counter = data.subarray(0, 2).readUint16BE();
        if (counter !== 0) {
            mock_serialport_1.instance._forwardData(data);
        }
    });
}
exports.setupEasunWifiConnection = setupEasunWifiConnection;
