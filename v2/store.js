"use strict";

const fs = require('fs');
const path = require('path');

const HISTORY_PATH = path.join(__dirname, 'json', 'zgodovina.json');

function gameKey(g) {
    return `${g.liga}|${g.datum}|${g.lokacija}`;
}

// Lokalni koledarski datum (ne UTC), da se ujema z datumi tekem (ki so
// prav tako lokalni avstrijski koledarski datumi, glej getNewDataV2.js).
function danesLokalno(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function loadHistory() {
    if (!fs.existsSync(HISTORY_PATH)) {
        return { games: {}, log: [] };
    }
    return JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
}

function saveHistory(history) {
    fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

// Primerja sveže pridobljene tekme (iz getNewDataV2.fetchAllGamesRaw) z obstoječo
// zgodovino in vrne posodobljeno zgodovino + seznam dogodkov (novo/zamenjava/izbris).
function applyGames(history, freshGames, now = new Date().toISOString(), danes = danesLokalno()) {
    const events = [];
    const videniKljuci = new Set();

    // Popravek starih napačnih zaznav: stran /explore kaže samo prihajajoče
    // tekme, zato je odigrana tekma prej pomotoma pristala kot "izbrisana".
    // Za pretekle datume to popravimo nazaj na "odigrana".
    Object.values(history.games).forEach(g => {
        if (g.izbrisana && g.datum < danes) {
            g.izbrisana = false;
            g.odigrana = true;
        }
    });

    freshGames.forEach(game => {
        const key = gameKey(game);
        videniKljuci.add(key);
        const obstojeca = history.games[key];

        if (!obstojeca) {
            history.games[key] = {
                liga: game.liga,
                datum: game.datum,
                ura: game.ura,
                lokacija: game.lokacija,
                domaci: game.domaci,
                gosti: game.gosti,
                status: game.status,
                assignments: game.assignments,
                izbrisana: false,
                odigrana: false,
                created_at: now,
                updated_at: now,
            };
            events.push({
                timestamp: now, tip: 'nova_tekma', liga: game.liga, datum: game.datum,
                lokacija: game.lokacija, assignments: game.assignments,
            });
            return;
        }

        // primerjaj vsako pozicijo (REF1, REF2, HREF1, HREF2, ...)
        const vsePozicije = new Set([
            ...Object.keys(obstojeca.assignments || {}),
            ...Object.keys(game.assignments || {}),
        ]);
        vsePozicije.forEach(pos => {
            const staro = (obstojeca.assignments || {})[pos] || null;
            const novo = (game.assignments || {})[pos] || null;
            if (staro === novo) return;

            let tip;
            if (!staro && novo) tip = 'dodan_sodnik';
            else if (staro && !novo) tip = 'odstranjen_sodnik';
            else tip = 'zamenjava';

            events.push({
                timestamp: now, tip, liga: game.liga, datum: game.datum,
                lokacija: game.lokacija, position: pos, staro, novo,
            });
        });

        if (obstojeca.izbrisana) {
            events.push({
                timestamp: now, tip: 'tekma_povrnjena', liga: game.liga,
                datum: game.datum, lokacija: game.lokacija,
            });
        }

        obstojeca.assignments = game.assignments;
        obstojeca.status = game.status;
        obstojeca.izbrisana = false;
        obstojeca.odigrana = false;
        obstojeca.updated_at = now;
    });

    // Tekme, ki so bile prej znane, a jih ni več na seznamu prihajajočih tekem:
    // - če je datum že minil, je bila tekma preprosto odigrana (stran kaže samo
    //   prihajajoče tekme, zato normalno izgine s seznama) - to ni napaka.
    // - če je datum še v prihodnosti, je bila tekma dejansko umaknjena/preklicana.
    Object.keys(history.games).forEach(key => {
        const g = history.games[key];
        if (videniKljuci.has(key) || g.izbrisana || g.odigrana) return;

        if (g.datum < danes) {
            g.odigrana = true;
            g.updated_at = now;
            events.push({
                timestamp: now, tip: 'tekma_odigrana', liga: g.liga,
                datum: g.datum, lokacija: g.lokacija,
            });
        } else {
            g.izbrisana = true;
            g.updated_at = now;
            events.push({
                timestamp: now, tip: 'izbrisana_tekma', liga: g.liga,
                datum: g.datum, lokacija: g.lokacija,
            });
        }
    });

    history.log = (history.log || []).concat(events);
    return { history, events };
}

// Vse tekme (aktivne, ne izbrisane) posameznega sodnika, ne glede na pozicijo.
function sodnikTekme(history, imeSodnika) {
    return Object.values(history.games)
        .filter(g => !g.izbrisana)
        .filter(g => Object.values(g.assignments || {}).includes(imeSodnika))
        .map(g => {
            const position = Object.keys(g.assignments).find(p => g.assignments[p] === imeSodnika);
            return { liga: g.liga, datum: g.datum, ura: g.ura, lokacija: g.lokacija, position };
        })
        .sort((a, b) => a.datum.localeCompare(b.datum));
}

module.exports = {
    HISTORY_PATH,
    gameKey,
    loadHistory,
    saveHistory,
    applyGames,
    sodnikTekme,
};
