"use strict";

// Enkraten testni zagon novega sistema (v2). Ne dotika data/AHLdelegacije.xlsx
// ali data/ICEHLdelegacije.xlsx - piše v v2/output/*.xlsx.
//
// Poženi z: node v2/run.js
//
// Za neprekinjeno preverjanje na interval (podobno staremu start.js) uporabi
// namesto tega: node v2/start.js

const { enkratnoPreverjanje, opisiDogodek, OUTPUT_DIR } = require('./core');
const { sodnikTekme } = require('./store');
const path = require('path');

async function main() {
    console.log('--- Pridobivanje podatkov z referee-manager.com ---');
    const { events, history, steviloTekem } = await enkratnoPreverjanje();
    console.log(`Najdenih ${steviloTekem} tekem na strani (AHL + ICEHL skupaj).\n`);

    console.log(`--- Spremembe od zadnjega zagona (${events.length}) ---`);
    if (events.length === 0) {
        console.log('Brez sprememb.');
    } else {
        events.forEach(e => console.log(opisiDogodek(e)));
    }

    console.log(`\n--- Excel datoteke ---`);
    console.log(path.join(OUTPUT_DIR, 'AHL.xlsx'));
    console.log(path.join(OUTPUT_DIR, 'ICEHL.xlsx'));

    console.log(`\n--- Primer: vse tekme za znanega sodnika (SteinerFe) ---`);
    console.log(JSON.stringify(sodnikTekme(history, 'SteinerFe'), null, 2));
}

main().catch(err => {
    console.error('Napaka:', err);
    process.exit(1);
});
