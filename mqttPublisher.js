const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://broker.hivemq.com');

const machines = [
    'MACHINE_001',
    'MACHINE_002',
    'MACHINE_003'
];

client.on('connect', function () {
    console.log('Connected to MQTT broker');

    setInterval(function () {

        machines.forEach(function (machineId) {

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

            console.log('Published:', sensorData);
        });

    }, 3000);
});