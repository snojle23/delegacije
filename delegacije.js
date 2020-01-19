"use strict";

const { vrniCellSodnik } = require("./vrniCellSodnik");
const { preveriAliObstajaDatum } = require("./preveriAliObstajaDatum");



const exceljs = require('exceljs');
const fs = require('fs')


//console.log(datoteka);

let json_data = JSON.parse(fs.readFileSync("json/tekme.json", 'utf8'));
const kaj = magic(json_data);


function magic(json_data) {
    let workbook = new exceljs.Workbook();
    workbook.xlsx.readFile('data/AHLdelegacije.xlsx')
        .then(workbook => {
            let workAHL = workbook.getWorksheet('AHL');
            let workEBEL = workbook.getWorksheet('EBEL');
            let workAHL_DAT = workbook.getWorksheet('AHL_DAT');
            let workAHL_DAT_STRING = workbook.getWorksheet('AHL_DAT_STRING');
            let noviDatumi = [];


            json_data.forEach(elementDate => { // gre cez use datume
                let datum = elementDate.datum;
                let ahlDatum =false;
                elementDate.lokacije.forEach(lokacije => { //gre cez use lokacije določen datum
                    let lokacija = lokacije.lokacija;
                    let liga = lokacije.liga;
                    let sodniki = lokacije.sodniki;
                    let sestavljenString = '';

                    if (liga == "AHL") {
                        ahlDatum = true;
                        sestavljenString += lokacija;
                        var i;
                        for (i = 0; i < 4; i++) {
                            sestavljenString += ";" + sodniki[i].ime;
                        }

                        let cellDate = vrniCellOdDatuma(workAHL_DAT_STRING, datum);
                        let rowDate = vrniRowOdDatuma(workAHL_DAT_STRING, cellDate, lokacija)

                        if (workAHL_DAT_STRING.getRow(rowDate).getCell(cellDate).value == null) {
                            workAHL_DAT_STRING.getRow(rowDate).getCell(cellDate).value = sestavljenString;
                            let today = new Date();
                            fs.appendFileSync("logs/logs.txt", "[" + today + "] " + "Nov datum dodan v delegacije. Datum:" + datum + "\n");

                        } else {
                            //poglej ce je kaksen sodnik zamenal in  ga prepisi
                            let str = workAHL_DAT_STRING.getRow(rowDate).getCell(cellDate).value.split(";");
                            var j;
                            for (j = 0; j < 4; j++) {
                                if (sodniki[j].ime != str[j + 1]) {
                                    console.log(sodniki[j].ime + "je zamenjal " + str[j + 1]);
                                    let today = new Date();
                                    fs.appendFileSync("logs/logs.txt", "[" + today + "] " + "Sodnik " + sodniki[j].ime + " uspesno zamenjal " + str[j + 1] + " Lokacija: " + str[0] + ", Datum: " + datum + "\n");
                                }
                            }
                            workAHL_DAT_STRING.getRow(rowDate).getCell(cellDate).value = sestavljenString;
                        }



                    }
                    else { //ebel DONE
                        var t;
                        for (t = 0; t < 4; t++) {
                            let sodnikCell = vrniCellSodnik(workEBEL, sodniki[t].ime);
                            dodajDatumSodnik(workEBEL, sodnikCell, datum, sodniki[t].ime)
                        }
                    }

                    
                })
                if(ahlDatum){
                    let cell = vrniCellOdDatuma(workAHL_DAT_STRING, datum);
                    updateAhlSchema(datum, workAHL_DAT, workAHL_DAT_STRING,cell);
                    noviDatumi.push(datum);
                }

            })
               // console.log(noviDatumi);
                noviDatumi.forEach(datee => {
                    let cell = vrniCellOdDatuma(workAHL_DAT_STRING, datee);
                    const seznam =  seznamSodnikovNaDatum(workAHL_DAT,cell);
                    const seznamAhl = getAllSudije(workAHL,datee); // preveri vse sodnike, kateri imajo ze določen datum.. če je 0 jim dodaj nove..
                    if(seznamAhl.length == 0){
                        dodajSodnikomDatum(workAHL,seznam,datee);
                    }else{
                        //gremo cez NOV seznam sodnikov in preverjamo z dosedanjimi
                        let zaDodat = [];
                        seznam.forEach(sodnikNovDatum => {
                            let tekma = false;
                            let o;
     
                            for(o=0; o<seznamAhl.length; o++ ){
                                if(seznamAhl[o] == sodnikNovDatum){
                                    //sodnik ze ima tekmo, do not
                                    tekma=true;
                                    seznamAhl[o]=null;
                                    return;
                                }
                            }
                            
                            if(!tekma){
                                zaDodat.push(sodnikNovDatum);
                                
                            }              
                        });
                        let o;
                        for(o=0; o<seznamAhl.length; o++ ){
                            if(seznamAhl[o] != null){
                                //sodnik ze ima tekmo, d
                                let cellSodnik = vrniCellSodnik(workAHL,seznamAhl[o]);
                                let roow=4;
                                let zbrisat;
                                while((zbrisat = workAHL.getRow(roow).getCell(cellSodnik).value )!= null){
                                    if(zbrisat == datee){
                                        workAHL.getRow(roow).getCell(cellSodnik).value="zbrisano";
                                        // workAHL.getRow(roow).getCell(cellSodnik).fill = {
                                        //     type: 'pattern',
                                        //     pattern:'solid',
                                        //     fgColor:{argb:'cccccc'}
                                        //   };
                                        console.log("Sodniku " +seznamAhl[o] +" se je izbrisal datum iz AHL sheme. Datum:"+ datee);
                                        return;
                                    }
                                    roow++;
                                }
                            }
                        }

                        if(zaDodat.length>0){
                            dodajSodnikomDatum(workAHL,zaDodat,datee);
                        }
                      //  console.log(" sodniki : "+seznam);
                       // console.log("seznam AHL:" +seznamAhl)
                    }
                  
              });
            workbook.xlsx.writeFile('data/AHLdelegacije.xlsx');
        });

}

function updateAhlSchema(datum1, ahl_dat, ahl_dat_string,cell) {

    if (ahl_dat.getRow(3).getCell(cell).value == null) {
        ahl_dat.getRow(3).getCell(cell).value = datum1;
        let today = new Date();
        fs.appendFileSync("logs/logsNovDatum.txt", "[" + today + "] " + "Nov datum dodan v AHL_DAT. Datum:" + datum1 + "\n");
        console.log("Nov datum dodan v AHL_DAT shemo" + today);
    }

    let countRow = 4;
    let countRowS = 4;
    while (ahl_dat_string.getRow(countRowS).getCell(cell).value != null) {

        let str = ahl_dat_string.getRow(countRowS).getCell(cell).value.split(";");
        var l;
        for (l = 1; l < 5; l++) {
            ahl_dat.getRow(countRow).getCell(cell).value = null;
            ahl_dat.getRow(countRow).getCell(cell).value = str[l];
            countRow++;
        }
        countRowS++;
    }
}

function vrniCellOdDatuma(worksheet, datum) {

    let countCell = 1;
    while (1) {
        if (worksheet.getRow(3).getCell(countCell).value == datum) {
            return countCell;
        }
        if (worksheet.getRow(3).getCell(countCell).value == null) {
            worksheet.getRow(3).getCell(countCell).value = datum;
            return countCell;
        }
        countCell++;
    }
    return countCell;

};
function vrniRowOdDatuma(worksheet, countCell, hala) {

    let countRow = 4;
    while (1) {

        if (worksheet.getRow(countRow).getCell(countCell).value == null) {

            return countRow;
        }
        else {
            let hh = worksheet.getRow(countRow).getCell(countCell).value
            let str = hh.split(";");
            if (str[0] == hala) {

                return countRow;
            }
        }
        countRow++;
    }
    return countRow;

};

function dodajDatumSodnik(worksheet, countCell, datum, sodnik) {
    let countRow = 4;
    while (1) {
        if (worksheet.getRow(countRow).getCell(countCell).value == null) {
            worksheet.getRow(countRow).getCell(countCell).value = datum;
            console.log(" za sodnika " + sodnik + " dodan nov datum " + datum + " [EBEL]");
            return;
        }
        else if (worksheet.getRow(countRow).getCell(countCell).value == datum) {
            return;
        }
        countRow++;
    }
}

function date(worksheet, datum){
    let cell = 1
    let d;
    while((d = worksheet.getRow(3).getCell(cell).value) != null){
        if(new Date(d) > datum ){
            return cell-1;
        }

        cell ++;
    }

    return cell-1;
}

function  seznamSodnikovNaDatum(worksheetAHL_DAT, cell){
    let row=4
    let seznam=[];
    let v;
    while((v = worksheetAHL_DAT.getRow(row).getCell(cell).value) != null){
        seznam.push(v);
        row++;
    }
return seznam;

}

function getAllSudije(worksheet, datum){
    let cellSodnik =1;
    let sudija;
    let list = [];

    while((sudija=worksheet.getRow(3).getCell(cellSodnik).value) != null ){
        let rowSudija = 4;
        let datu;
        while((datu = worksheet.getRow(rowSudija).getCell(cellSodnik).value) != null){
            if(datu == datum){
                
                list.push(sudija);
            }

           rowSudija++; 
        }

        cellSodnik++;
    }
return list;
}

function dodajSodnikomDatum(worksheet, list, datum){
    list.forEach(sodnik => {
        let cellSodnik = vrniCellSodnik(worksheet,sodnik);
        let rowSudija = 4
        while(worksheet.getRow(rowSudija).getCell(cellSodnik).value != null){
            rowSudija++;
        }
        worksheet.getRow(rowSudija).getCell(cellSodnik).value = datum;
        console.log("Za sodnika " + sodnik+ " dodan nov datum: "+datum + " [AHL]" );

    });
}