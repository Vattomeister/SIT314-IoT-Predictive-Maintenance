const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://broker.hivemq.com');

// Number of machines for this test
const numberOfMachines = 100;

client.on('connect', function () {
    console.log('Connected to MQTT broker');
    console.log(`Starting load test with ${numberOfMachines} machines...`);

    const startTime = Date.now();

    for (let i = 1; i <= numberOfMachines; i++) {

        const machineId = `MACHINE_${String(i).padStart(3, '0')}`;

        const sensorData = {
            machineId: machineId,
            temperature: Math.floor(Math.random() * 80) + 20,
            vibration: Number((Math.random() * 10).toFixed(2)),
            current: Number((Math.random() * 30).toFixed(2)),
            timestamp: new Date().toISOString()
        };

        const topic =
            `sit314/predictive-maintenance/${machineId.toLowerCase()}`;

        client.publish(topic, JSON.stringify(sensorData));

        console.log(`Published data for ${machineId}`);
    }

    const endTime = Date.now();

    console.log('-----------------------------');
    console.log(`Machines: ${numberOfMachines}`);
    console.log(`Messages published: ${numberOfMachines}`);
    console.log(`Publishing time: ${endTime - startTime} ms`);
    console.log('-----------------------------');

    setTimeout(function () {
        client.end();
    }, 2000);
});