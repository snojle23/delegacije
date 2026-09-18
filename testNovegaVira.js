"use strict";

// Testni vmesnik za nov vir podatkov (getNewDataV2.js).
// Poženi z: node testNovegaVira.js
// Ne piše v Excel, samo prikaže, kaj bi program dobil z novega vira.

const { getData2, imeVSodniski } = require('./getNewDataV2');

function preveriImena() {
    console.log('--- Preverjanje formata imen (primerjava z znanimi vzdevki v Excelu) ---');
    const primeri = [
        ['Felix Steiner', 'SteinerFe'],
        ['Alexander Hlavaty', 'HlavatyAl'],
        ['Marco Veselka', 'VeselkaMa'],
        ['Miha Bulovec', 'BulovecMi'],
        ['Anže Bergant', 'BergantAn'],
    ];
    let vseOk = true;
    primeri.forEach(([polno, pricakovano]) => {
        const dejansko = imeVSodniski(polno);
        const ok = dejansko === pricakovano;
        if (!ok) vseOk = false;
        console.log(`  ${ok ? 'OK  ' : 'NAPAKA'} ${polno} -> ${dejansko} (pričakovano: ${pricakovano})`);
    });
    console.log(vseOk ? 'Vsi primeri se ujemajo.\n' : 'Nekateri primeri se NE ujemajo, preveri imeVSodniski().\n');
}

async function main() {
    preveriImena();

    console.log('--- Pridobivanje podatkov z novega vira (referee-manager.com/explore) ---');
    const tekme = await getData2();

    if (tekme.length === 0) {
        console.log('Ni najdenih tekem (lahko je normalno, če sezona še ni v teku, ali napaka pri dostopu - glej izpis zgoraj).');
        return;
    }

    console.log(`Najdenih ${tekme.length} datum(ov) s tekmami:\n`);
    tekme
        .sort((a, b) => a.datum.localeCompare(b.datum))
        .forEach(dan => {
            console.log(`${dan.datum}`);
            dan.lokacije.forEach(lok => {
                const sodniki = lok.sodniki.map(s => s.ime).join(', ') || '(brez dodeljenih sodnikov)';
                console.log(`  [${lok.liga}] ${lok.lokacija} — ${sodniki}`);
            });
        });

    console.log('\n--- Surov JSON (za natančen pregled) ---');
    console.log(JSON.stringify(tekme, null, 2));
}

main();
