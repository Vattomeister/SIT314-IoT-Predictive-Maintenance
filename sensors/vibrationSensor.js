function getVibration() {
    const minVibration = 0;
    const maxVibration = 10;

    const vibration =
        (Math.random() * (maxVibration - minVibration) + minVibration).toFixed(2);

    return Number(vibration);
}

module.exports = getVibration;