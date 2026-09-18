"use strict";

const exceljs = require('exceljs');

const POZICIJE_VRSTNI_RED = ['HREF1', 'HREF2', 'REF1', 'REF2'];

function sortiraneTekme(history, liga) {
    return Object.values(history.games)
        .filter(g => g.liga === liga)
        .sort((a, b) => a.datum.localeCompare(b.datum) || a.lokacija.localeCompare(b.lokacija));
}

function vseSodnike(tekme) {
    const sodniki = new Set();
    tekme.forEach(g => {
        if (g.izbrisana) return;
        Object.values(g.assignments || {}).forEach(ime => { if (ime) sodniki.add(ime); });
    });
    return Array.from(sodniki).sort();
}

function listTekme(workbook, tekme) {
    const sheet = workbook.addWorksheet('Tekme');
    sheet.columns = [
        { header: 'Datum', key: 'datum', width: 12 },
        { header: 'Ura', key: 'ura', width: 8 },
        { header: 'Lokacija', key: 'lokacija', width: 30 },
        { header: 'Domači', key: 'domaci', width: 20 },
        { header: 'Gosti', key: 'gosti', width: 20 },
        { header: 'HREF1', key: 'HREF1', width: 14 },
        { header: 'HREF2', key: 'HREF2', width: 14 },
        { header: 'REF1', key: 'REF1', width: 14 },
        { header: 'REF2', key: 'REF2', width: 14 },
        { header: 'Status', key: 'status', width: 12 },
    ];
    sheet.getRow(1).font = { bold: true };

    tekme.forEach(g => {
        const row = sheet.addRow({
            datum: g.datum,
            ura: g.ura,
            lokacija: g.izbrisana ? `ZBRISANO: ${g.lokacija}` : g.lokacija,
            domaci: g.domaci,
            gosti: g.gosti,
            status: g.status,
            ...g.assignments,
        });
        if (g.izbrisana) {
            row.font = { strike: true, color: { argb: 'FF999999' } };
        } else if (g.odigrana) {
            row.font = { color: { argb: 'FFAAAAAA' } };
        }
    });
}

function colLetter(col) {
    let letter = '';
    while (col > 0) {
        const rem = (col - 1) % 26;
        letter = String.fromCharCode(65 + rem) + letter;
        col = Math.floor((col - 1) / 26);
    }
    return letter;
}

const SODNIKI_PRVI_DATUM_ROW = 4;
const SODNIKI_ZADNJI_DATUM_ROW = 500; // dovolj velika meja za COUNTA formulo

// Vrstica 1: prazna. Vrstica 2: število tekem (formula, samodejno se posodobi).
// Vrstica 3: ime sodnika. Vrstica 4+: datumi.
function listSodniki(workbook, tekme, sodniki) {
    const sheet = workbook.addWorksheet('Sodniki');
    sheet.getRow(3).font = { bold: true };
    sheet.getRow(2).font = { italic: true, color: { argb: 'FF666666' } };

    sodniki.forEach((sodnik, i) => {
        const col = i + 1;
        const letter = colLetter(col);
        sheet.getRow(3).getCell(col).value = sodnik;
        sheet.getRow(2).getCell(col).value = {
            formula: `COUNTA(${letter}${SODNIKI_PRVI_DATUM_ROW}:${letter}${SODNIKI_ZADNJI_DATUM_ROW})`,
        };

        const datumi = tekme
            .filter(g => !g.izbrisana)
            .filter(g => Object.values(g.assignments || {}).includes(sodnik))
            .map(g => g.datum)
            .sort();

        datumi.forEach((datum, j) => {
            sheet.getRow(SODNIKI_PRVI_DATUM_ROW + j).getCell(col).value = datum;
        });
    });
    if (sheet.columns) {
        sheet.columns.forEach(c => { c.width = 14; });
    }
}

function listLog(workbook, log, liga) {
    const sheet = workbook.addWorksheet('Log');
    sheet.columns = [
        { header: 'Čas', key: 'timestamp', width: 22 },
        { header: 'Tip', key: 'tip', width: 18 },
        { header: 'Datum tekme', key: 'datum', width: 12 },
        { header: 'Lokacija', key: 'lokacija', width: 28 },
        { header: 'Pozicija', key: 'position', width: 10 },
        { header: 'Staro', key: 'staro', width: 14 },
        { header: 'Novo', key: 'novo', width: 14 },
    ];
    sheet.getRow(1).font = { bold: true };
    log.filter(e => e.liga === liga)
        .slice()
        .reverse() // najnovejše na vrhu
        .forEach(e => sheet.addRow(e));
}

async function generirajWorkbook(history, liga) {
    const workbook = new exceljs.Workbook();
    const tekme = sortiraneTekme(history, liga);
    const sodniki = vseSodnike(tekme);

    listTekme(workbook, tekme);
    listSodniki(workbook, tekme, sodniki);
    listLog(workbook, history.log || [], liga);

    return workbook;
}

async function generirajInShrani(history, liga, filePath) {
    const workbook = await generirajWorkbook(history, liga);
    await workbook.xlsx.writeFile(filePath);
    return filePath;
}

module.exports = {
    generirajWorkbook,
    generirajInShrani,
};
