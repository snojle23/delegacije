"use strict";
const { vrniCellOdDatuma,
    dodajSodnikomDatum,
    getAllSudije,
    seznamSodnikovNaDatum,
    dodajDatumSodnik,
    vrniRowOdDatuma,
    writeToExcel,
    updateDatesInExcel,
    updateAhlSchema } = require('./helpers');

const exceljs = require('exceljs');

async function delegacije(json_data, arrayForMail) {
    let workbook = new exceljs.Workbook();
    let iceHLWB = new exceljs.Workbook();
    const ahlWorkbook = await workbook.xlsx.readFile('data/AHLdelegacije.xlsx');
    const icehlWorkbook = await iceHLWB.xlsx.readFile('data/ICEHLdelegacije.xlsx');

    const workAHL = await ahlWorkbook.getWorksheet('AHL');
    const workAHL_DAT = await ahlWorkbook.getWorksheet('AHL_DAT');
    const workAHL_DAT_STRING = await ahlWorkbook.getWorksheet('AHL_DAT_STRING');

    const workICEHL = await icehlWorkbook.getWorksheet('ICEHL');
    const workICEHL_DAT = await icehlWorkbook.getWorksheet('ICEHL_DAT');
    const workICEHL_DAT_STRING = await icehlWorkbook.getWorksheet('ICEHL_DAT_STRING');
    const noviDatumiAHL = [];
    const noviDatumiICEHL = [];
    //const filterDates = ['2022-09-09','2022-09-11'];

    (json_data || []).filter(i => i.datum > '2023-09-14').forEach(elementDate => { // gre cez use datume
        let datum = elementDate.datum;
        let ahlDatum = false;
        let icehlDatum = false;
        elementDate.lokacije.forEach(lokacije => { //gre cez use lokacije določen datum
            let liga = lokacije.liga;
            if (liga === "AHL") {
                ahlDatum = true;
                writeToExcel(workAHL_DAT_STRING, lokacije, liga, datum);
            }
            else { 
                icehlDatum = true;
                writeToExcel(workICEHL_DAT_STRING, lokacije, liga, datum);
            }
            if(ahlDatum){
                let cell = vrniCellOdDatuma(workAHL_DAT_STRING, datum);
                updateAhlSchema(datum, workAHL_DAT, workAHL_DAT_STRING, cell, true);
                if(!noviDatumiAHL.includes(datum)){
                    noviDatumiAHL.push(datum);
                }
            }
            if(icehlDatum){
                let cell = vrniCellOdDatuma(workICEHL_DAT_STRING, datum);
                updateAhlSchema(datum, workICEHL_DAT, workICEHL_DAT_STRING, cell, false);
                if(!noviDatumiICEHL.includes(datum)){
                    noviDatumiICEHL.push(datum);
                }
            }
        })
    })
    // console.log(noviDatumi);
    updateDatesInExcel(noviDatumiAHL, workAHL, workAHL_DAT, workAHL_DAT_STRING, true, json_data, arrayForMail);
    updateDatesInExcel(noviDatumiICEHL, workICEHL, workICEHL_DAT, workICEHL_DAT_STRING, false, json_data, arrayForMail);
    //console.log("konec delegacij.js");
    await workbook.xlsx.writeFile('data/AHLdelegacije.xlsx');
    await iceHLWB.xlsx.writeFile('data/ICEHLdelegacije.xlsx');
}


module.exports = {
    dodajSodnikomDatum,
    getAllSudije,
    seznamSodnikovNaDatum,
    dodajDatumSodnik,
    updateAhlSchema,
    vrniCellOdDatuma,
    vrniRowOdDatuma,
    delegacije
}