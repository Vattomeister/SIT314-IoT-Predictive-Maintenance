function getCurrent() {
    const minCurrent = 5;
    const maxCurrent = 30;

    const current =
        (Math.random() * (maxCurrent - minCurrent) + minCurrent).toFixed(2);

    return Number(current);
}

module.exports = getCurrent;