"use strict";

// Nov vir podatkov po prenovi strani referee-manager.com.
// Namesto stare HTML tabele (besetzungsliste_instanz.php) zdaj beremo
// JSON, ki je vgrajen v data-page atribut (Inertia.js) na javno dostopni
// strani /explore/regions/{id}?type=division. Dostop ne zahteva prijave.

const DIVISIONS = [
    { id: 74, liga: "AHL" },    // AlpsHL (novo ime za AHL)
    { id: 73, liga: "ICEHL" },  // ICEHL
];

function decodeHtmlEntities(str) {
    return str
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

function extractDataPage(html) {
    const match = html.match(/data-page="([^"]*)"/);
    if (!match) {
        throw new Error("Ne najdem data-page atributa v HTML-ju. Stran se je morda spet spremenila.");
    }
    return JSON.parse(decodeHtmlEntities(match[1]));
}

// Priimek (Title Case) + prva 2 znaka imena, npr. "Felix Steiner" -> "SteinerFe"
// Ujema se z obstoječim formatom vzdevkov v Excelu (preverjeno na SteinerFe, HlavatyAl, VeselkaMa, ...).
function imeVSodniski(fullName) {
    if (!fullName) {
        return "unknown";
    }
    const parts = fullName.trim().split(/\s+/);
    const ime = parts[0];
    const priimek = parts.slice(1).join(' ') || parts[0];
    const priimekLower = priimek.toLowerCase();
    const priimekTitle = priimekLower.charAt(0).toUpperCase() + priimekLower.slice(1);
    return `${priimekTitle}${ime.substring(0, 2)}`;
}

async function fetchDivision(id) {
    const url = `https://www.referee-manager.com/explore/regions/${id}?type=division`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} za ${url}`);
    }
    const html = await res.text();
    const data = extractDataPage(html);
    return data.props.games || [];
}

function transformGames(games, tekme) {
    games.forEach(game => {
        const datum = (game.date || '').slice(0, 10); // lokalni koledarski datum, brez pretvorbe v UTC
        const lokacija = game.venue ? game.venue.name : 'unknown';
        const liga = game.division ? game.division.short_name : 'unknown';

        const sodniki = (game.assignments || [])
            .filter(a => a.role === 'referee')
            .sort((a, b) => (a.position || '').localeCompare(b.position || ''))
            .map(a => ({ ime: imeVSodniski(a.user ? a.user.name : null) }));

        const lokacijaObj = { lokacija, liga, sodniki };

        const obstojecDatum = tekme.find(i => i.datum === datum);
        if (obstojecDatum) {
            obstojecDatum.lokacije.push(lokacijaObj);
        } else {
            tekme.push({ datum, lokacije: [lokacijaObj] });
        }
    });
    return tekme;
}

async function getData2() {
    let vsetekme = [];
    try {
        for (const div of DIVISIONS) {
            const games = await fetchDivision(div.id);
            transformGames(games, vsetekme);
        }
    } catch (err) {
        console.log('Prislo je do napake pri pridobivanju podatkov iz strani. Najbrž ni dosegljiva.');
        console.log(err.message);
    }
    return vsetekme;
}

// Isto kot getData2, a ohrani pozicije (REF1/REF2/HREF1/HREF2) namesto,
// da jih splošči v seznam - potrebno za natančno zaznavanje zamenjav.
function transformGameToRaw(game) {
    const datum = (game.date || '').slice(0, 10);
    const lokacija = game.venue ? game.venue.name : 'unknown';
    const liga = game.division ? game.division.short_name : 'unknown';
    const ura = (game.date || '').slice(11, 16);

    const assignments = {};
    (game.assignments || [])
        .filter(a => a.role === 'referee')
        .forEach(a => {
            const position = (a.position || '').replace(/\s+/g, ''); // "REF 1" -> "REF1"
            assignments[position] = imeVSodniski(a.user ? a.user.name : null);
        });

    return {
        liga,
        datum,
        ura,
        lokacija,
        domaci: game.home_team ? game.home_team.name : null,
        gosti: game.away_team ? game.away_team.name : null,
        status: game.status || null,
        assignments,
    };
}

async function fetchAllGamesRaw() {
    let vseIgre = [];
    for (const div of DIVISIONS) {
        const games = await fetchDivision(div.id);
        vseIgre = vseIgre.concat(games.map(transformGameToRaw));
    }
    return vseIgre;
}

module.exports = {
    getData2,
    imeVSodniski,
    extractDataPage,
    fetchAllGamesRaw,
};
