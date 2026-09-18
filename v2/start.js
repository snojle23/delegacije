"use strict";

// Neprekinjeno preverjanje sprememb - novi sistem (v2), vzporedno s starim start.js.
// Ne dotika data/AHLdelegacije.xlsx ali data/ICEHLdelegacije.xlsx - piše v
// v2/output/*.xlsx in v2/json/zgodovina.json.
//
// Poženi z: node v2/start.js
// (pusti teči v ozadju/terminalu, tako kot stari "node start.js")

const fs = require('fs');
const path = require('path');
const { enkratnoPreverjanje, opisiDogodek, OUTPUT_DIR } = require('./core');

const MIN = 90; // enak interval kot pri starem sistemu
const LOG_PATH = path.join(__dirname, 'logs', 'spremembe.txt');

function zapisiVLog(vrstice) {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.appendFileSync(LOG_PATH, vrstice.join('\n') + '\n');
}

async function preveri() {
    const zdaj = new Date();
    process.stdout.write(`\n[${zdaj.toLocaleString('sl-SI')}] Preverjam spremembe... `);

    try {
        const { events, steviloTekem } = await enkratnoPreverjanje();

        if (events.length === 0) {
            console.log(`brez sprememb (${steviloTekem} tekem na strani).`);
            return;
        }

        console.log(`${events.length} sprememb(a) najdenih:`);
        const vrstice = events.map(e => `[${zdaj.toISOString()}] ${opisiDogodek(e)}`);
        vrstice.forEach(v => console.log('  ' + v));
        zapisiVLog(vrstice);
    } catch (err) {
        console.log('napaka pri preverjanju:');
        console.log(err.message);
    }
}

console.log(`v2/start.js zagnan. Preverjanje vsakih ${MIN} minut.`);
console.log(`Excel za primerjavo: ${OUTPUT_DIR}`);
console.log(`Log sprememb: ${LOG_PATH}`);

preveri(); // takoj ob zagonu, nato na interval
setInterval(preveri, MIN * 60 * 1000);
