"use strict";

const path = require('path');
const fs = require('fs');
const { fetchAllGamesRaw } = require('../getNewDataV2');
const { loadHistory, saveHistory, applyGames } = require('./store');
const { generirajInShrani } = require('./excelGenerator');

const OUTPUT_DIR = path.join(__dirname, 'output');

function opisiDogodek(e) {
    switch (e.tip) {
        case 'nova_tekma':
            return `NOVA TEKMA  [${e.liga}] ${e.datum} @ ${e.lokacija}`;
        case 'zamenjava':
            return `ZAMENJAVA   [${e.liga}] ${e.datum} @ ${e.lokacija} — ${e.position}: ${e.staro} -> ${e.novo}`;
        case 'dodan_sodnik':
            return `DODAN       [${e.liga}] ${e.datum} @ ${e.lokacija} — ${e.position}: ${e.novo}`;
        case 'odstranjen_sodnik':
            return `ODSTRANJEN  [${e.liga}] ${e.datum} @ ${e.lokacija} — ${e.position}: ${e.staro}`;
        case 'izbrisana_tekma':
            return `IZBRISANA TEKMA [${e.liga}] ${e.datum} @ ${e.lokacija}`;
        case 'tekma_odigrana':
            return `ODIGRANA TEKMA (umaknjena z /explore, ne gre za izbris) [${e.liga}] ${e.datum} @ ${e.lokacija}`;
        case 'tekma_povrnjena':
            return `TEKMA POVRNJENA [${e.liga}] ${e.datum} @ ${e.lokacija}`;
        default:
            return JSON.stringify(e);
    }
}

// En cikel preverjanja: pridobi trenutno stanje, primerja z zgodovino,
// shrani posodobljeno zgodovino in regenerira testni Excel. Vrne najdene dogodke.
async function enkratnoPreverjanje() {
    const freshGames = await fetchAllGamesRaw();

    let history = loadHistory();
    const { history: novaHistory, events } = applyGames(history, freshGames);
    history = novaHistory;
    saveHistory(history);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    await generirajInShrani(history, 'AHL', path.join(OUTPUT_DIR, 'AHL.xlsx'));
    await generirajInShrani(history, 'ICEHL', path.join(OUTPUT_DIR, 'ICEHL.xlsx'));

    return { events, history, steviloTekem: freshGames.length };
}

module.exports = {
    OUTPUT_DIR,
    opisiDogodek,
    enkratnoPreverjanje,
};
