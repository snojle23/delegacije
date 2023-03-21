const request = require("request");
const cheerio = require("cheerio");
const moment = require('moment');

// const url = "https://www.referee-manager.com/besetzungsliste_instanz.php?type=LandesReferent&region=9&Kategorie_Nr=2&Kat_Stufe==";

function transform(body, tekme = []) {

    if (!body ||typeof body !== 'string') {
        console.log('Expected a string as input, got ' + typeof body);
    }
    
    const $ = cheerio.load(body);
    const rows = $('table tbody tr');
    //  console.log(rows.text());
    let obj = { sodniki: [] };

    rows.each((index, row) => {
        const cells = $(row).find('td');
        const vrsticaText = $(cells).text();

        if (vrsticaText.length > 40) {
            // console.log("vrstica:");
            let element;
            if (index !== 1) {
                const a = tekme.find(i => i.datum === obj.datum);
                if (a) {
                    a.lokacije.push({
                        lokacija: obj.lokacija,
                        liga: obj.liga,
                        sodniki: obj.sodniki
                    })
                } else { // nov datum
                    tekme.push({
                        datum: obj.datum,
                        lokacije: [{
                            lokacija: obj.lokacija,
                            liga: obj.liga,
                            sodniki: obj.sodniki
                        }]
                    });
                }
            }
            obj = { sodniki: [] };
            // console.log($(cells).text());
            cells.each((index, cell) => {
                if (index === 1) { // datum
                    // console.log('datum');
                    const celltext = $(cell).text();
                    const dateString = celltext.split(' ')[1];
                    const date = moment.utc(dateString, "DD.MM.YYYY");
                    const isoDate = date.toISOString().slice(0, 10);
                    obj.datum = isoDate;
                    // console.log("datum: " +dateString + " "+ "poIso: " + isoDate);
                }
                if (index === 3) { // lokacija
                    const celltext = $(cell).text();
                    obj.lokacija = celltext;
                } if (index === 7) { // liga
                    const celltext = $(cell).text();
                    obj.liga = celltext;
                }
            });

        } else {
            cells.each((index, cell) => {
                if (index === 1) { // sodnik
                    const celltext = $(cell).text();
                    obj.sodniki.push({ ime: celltext });
                    // obj.sodniki.push(celltext);
                    // console.log(celltext);
                }
                const celltext = $(cell).text();
                // console.log(celltext);
            });
        }
    });
    const a = tekme.find(i => i.datum === obj.datum);
    if (a) {
        a.lokacije.push({
            lokacija: obj.lokacija,
            liga: obj.liga,
            sodniki: obj.sodniki
        })
    } else if (obj.datum !== undefined) { // nov datum
        tekme.push({
            datum: obj.datum,
            lokacije: [{
                lokacija: obj.lokacija,
                liga: obj.liga,
                sodniki: obj.sodniki
            }]
        });
    }

    return tekme;
}

async function getData(url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) {
                reject(error);
            }
            resolve(body);
        });
    });
}

async function getData2() {
    const ahl = "https://www.referee-manager.com/besetzungsliste_instanz.php?type=LandesReferent&region=9&Kategorie_Nr=2&Kat_Stufe=="
    const icehl = "https://www.referee-manager.com/besetzungsliste_instanz.php?type=LandesReferent&region=9&Kategorie_Nr=1&Kat_Stufe=="
    let vsetekme = [];
    let ahlData, icehlData;
    try {
        icehlData = await getData(icehl);
        ahlData = await getData(ahl);
        const icehlTekme = transform(icehlData);
        vsetekme = transform(ahlData, icehlTekme);
    } catch (err) {
       // do nothing
    }
    // console.log(JSON.stringify(vsetekme));
    return vsetekme;
}

getData2();

module.exports = {
    getData2
};
