const fs = require('fs');

function vrniCellSodnik(worksheet, sodnik, isAHL) {
    let countCell = 1;
    while(1) {
        if (worksheet.getRow(3).getCell(countCell).value == sodnik) {
            return countCell;
        }
        else if (worksheet.getRow(3).getCell(countCell).value == null) {
            worksheet.getRow(3).getCell(countCell).value = sodnik;
            console.log("Nov sodnik dodan v bazo: " + sodnik);
            let today = new Date();
            if(isAHL){
                fs.appendFileSync("logs/logsAHL.txt", "[" + today + "] " + "Nov sodnik" + sodnik + " uspesno dodan " + "\n");
            }else{
                fs.appendFileSync("logs/logsICEHL.txt", "[" + today + "] " + "Nov sodnik" + sodnik + " uspesno dodan " + "\n");
            }

            return countCell;
        }
        countCell++;
    }
}


function writeToExcel(DAT_STRING, lokacije, liga, datum){
    let lokacija = lokacije.lokacija;
    let sodniki = lokacije.sodniki;
    let sestavljenString = '';

    sestavljenString += lokacija;
    let i;
    for (i = 0; i < 4; i++) {
        sestavljenString += ";" + sodniki[i].ime;
    }

    let cellDate = vrniCellOdDatuma(DAT_STRING, datum);
    let rowDate = vrniRowOdDatuma(DAT_STRING, cellDate, lokacija)

    if (DAT_STRING.getRow(rowDate).getCell(cellDate).value == null) {
        DAT_STRING.getRow(rowDate).getCell(cellDate).value = sestavljenString;
        let today = new Date();
        fs.appendFileSync(`logs/logs${liga}.txt`, "[" + today + "] " + "Nov datum dodan v delegacije. Datum:" + datum + "\n");
    } else {
        //poglej ce je kaksen sodnik zamenal in  ga prepisi
        let str = DAT_STRING.getRow(rowDate).getCell(cellDate).value.split(";");
        for (let j = 0; j < 4; j++) {
            if (sodniki[j].ime != str[j + 1]) {
                console.log(sodniki[j].ime + " je zamenjal " + str[j + 1]);
                let today = new Date();
                fs.appendFileSync("logs/logs.txt", "[" + today + "] " + "Sodnik " + sodniki[j].ime + " uspesno zamenjal " + str[j + 1] + " Lokacija: " + str[0] + ", Datum: " + datum + "\n");
            }
        }
        DAT_STRING.getRow(rowDate).getCell(cellDate).value = sestavljenString;
    }
}

function updateDatesInExcel(noviDatumi, mainWorkbook, DAT, DAT_STRING, isAHL, jsonDate ){
 
    noviDatumi.forEach(datee => {
        let cell = vrniCellOdDatuma(DAT_STRING, datee);
        const seznam =  seznamSodnikovNaDatum(DAT,cell);
        const seznamAhl = getAllSudije(mainWorkbook,datee); // preveri vse sodnike, kateri imajo ze določen datum.. če je 0 jim dodaj nove..
        if(seznamAhl.length == 0){
            dodajSodnikomDatum(mainWorkbook, seznam, datee, isAHL);
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
                    let cellSodnik = vrniCellSodnik(mainWorkbook, seznamAhl[o], isAHL);
                    let roow=4;
                    let zbrisat;
                    while((zbrisat = mainWorkbook.getRow(roow).getCell(cellSodnik).value )!= null){
                        if(zbrisat == datee){
                            mainWorkbook.getRow(roow).getCell(cellSodnik).value="zbrisano";
                            // workAHL.getRow(roow).getCell(cellSodnik).fill = {
                            //     type: 'pattern',
                            //     pattern:'solid',
                            //     fgColor:{argb:'cccccc'}
                            //   };
                            if(isAHL){
                                console.log("Sodniku " +seznamAhl[o] +" se je izbrisal datum iz AHL sheme. Datum:"+ datee);
                            }else{
                                console.log("Sodniku " +seznamAhl[o] +" se je izbrisal datum iz ICEHL sheme. Datum:"+ datee);
                            }
                            
                            return;
                        }
                        roow++;
                    }
                }
            }

            if(zaDodat.length>0){
                dodajSodnikomDatum(mainWorkbook, zaDodat, datee, isAHL);
            }
            //  console.log(" sodniki : "+seznam);
            // console.log("seznam AHL:" +seznamAhl)
        }

        const gamesPerDateExcel= getGamesPerDate(DAT_STRING, datee);
        const locations = jsonDate.find(d => d.datum === datee).lokacije;
        const gamesInJson = countLocation(locations, isAHL);

        if(gamesPerDateExcel !== gamesInJson){
            if(isAHL){
                console.log(` Staro število tekem za AHL na datum: ${datee}: ${gamesPerDateExcel}\n nove tekme: ${gamesInJson}`)

            }else{
                console.log(` Staro število tekem za ICEHL na datum: ${gamesPerDateExcel}; nove tekme: ${gamesInJson}`)

            }
        }
    });
}

//
function getGamesPerDate(worksheet, date){
    let cell = vrniCellOdDatuma(worksheet, date);
    let countCell = 0;
    let rowNumber = 4;
    while (worksheet.getRow(rowNumber).getCell(cell).value != null) {
        rowNumber++;
        countCell++;
    }

    return countCell;
}

function updateAhlSchema(datum1, ahl_dat, ahl_dat_string, cell, isAhl) {

    if (ahl_dat.getRow(3).getCell(cell).value == null) {
        ahl_dat.getRow(3).getCell(cell).value = datum1;
        let today = new Date();
        if(isAhl){
            fs.appendFileSync("logs/logsNovDatum.txt", "[" + today + "] " + "Nov datum dodan v AHL_DAT. Datum:" + datum1 + "\n");
            console.log("Nov datum dodan v AHL_DAT shemo" + today);
        }else{
            fs.appendFileSync("logs/logsICEHL.txt", "[" + today + "] " + "Nov datum dodan v ICEHL_DAT. Datum:" + datum1 + "\n");
            console.log("Nov datum dodan v ICEHL_DAT shemo" + today);
        }
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

function seznamSodnikovNaDatum(worksheetAHL_DAT, cell){
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

function dodajSodnikomDatum(worksheet, list, datum, isAHL){
    list.forEach(sodnik => {
        let cellSodnik = vrniCellSodnik(worksheet, sodnik, isAHL);
        let rowSudija = 4
        while(worksheet.getRow(rowSudija).getCell(cellSodnik).value != null){
            rowSudija++;
        }
        worksheet.getRow(rowSudija).getCell(cellSodnik).value = datum;
        if(isAHL){
            console.log("Za sodnika " + sodnik+ " dodan nov datum: "+datum + " [AHL]" );
            if(sodnik.toLowerCase() === "snoj"){
                console.log("---------------------------\n NOVA AHL TEKMA \n -------------------------- \n");
            }
        }else {
            console.log("Za sodnika " + sodnik+ " dodan nov datum: "+datum + " [ICEHL]" );
            if(sodnik.toLowerCase() === "snoj"){
                console.log("---------------------------\n NOVA ICEHL TEKMA \n -------------------------- \n");
            }
        }
    });
}

function countLocation(lokacije, isAHL) {
    let count = 0;
    if(!lokacije){
        return 0;
    }
    const find = isAHL ? "AHL" : "ICEHL"
    lokacije.forEach(lok => {
        if(lok.liga === find){
            count++;
        }
    });

    return count;
}

module.exports = {
    vrniCellSodnik,
    dodajSodnikomDatum,
    getAllSudije,
    seznamSodnikovNaDatum,
    dodajDatumSodnik,
    vrniRowOdDatuma,
    writeToExcel,
    updateDatesInExcel,
    updateAhlSchema,
    vrniCellOdDatuma
};
