const { dodajSodnikomDatum,
    getAllSudije,
    seznamSodnikovNaDatum,
    dodajDatumSodnik,
    updateAhlSchema,
    vrniCellOdDatuma,
    vrniRowOdDatuma} = require('./delegacije');

    const { vrniCellSodnik } = require("./vrniCellSodnik");
    
    
    const exceljs = require('exceljs');
    const fs = require('fs')
    
    
    //console.log(datoteka);

    
function magicUmesni(json_data) {
    let workbook = new exceljs.Workbook();
    workbook.xlsx.readFile('data/AHLdelegacijeUmesni.xlsx')
        .then(workbook => {
            let workAHL = workbook.getWorksheet('AHL');
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
                            //poglej ce je kaksen sodnik zamenal in ga prepisi
                            let str = workAHL_DAT_STRING.getRow(rowDate).getCell(cellDate).value.split(";");
                            var j;
                            for (j = 0; j < 4; j++) {
                                if (sodniki[j].ime != str[j + 1]) {
                                    let today = new Date();
                                    fs.appendFileSync("logs/logs.txt", "[" + today + "] " + "Sodnik " + sodniki[j].ime + " uspesno zamenjal " + str[j + 1] + " Lokacija: " + str[0] + ", Datum: " + datum + "\n");
                                }
                            }
                            workAHL_DAT_STRING.getRow(rowDate).getCell(cellDate).value = sestavljenString;
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
            console.log("umesni zakljucen");
            workbook.xlsx.writeFile('data/AHLdelegacijeUmesni.xlsx');
        });
}
module.exports = {
    magicUmesni
};