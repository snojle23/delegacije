"use strict";

const { preveriCeSodnikObstaja } = require("./preveriCeSodnikObstaja.1");
const { preveriAliObstajaDatum } = require("./preveriAliObstajaDatum");
const  noviJson  = require("./getNewJson.js");

const exceljs = require('exceljs');
const fs = require('fs')

const datoteka =  noviJson();

let json_data=JSON.parse(fs.readFileSync("json/tekme.json",'utf8'));
const kaj = magic(json_data);

function magic(json_data){
    let workbook = new exceljs.Workbook();
    workbook.xlsx.readFile('data/AHLdelegacije.xlsx')
    .then(workbook => {
        let workAHL = workbook.getWorksheet('AHL');
        let workAHL_DAT = workbook.getWorksheet('AHL_DAT');
        let workAHL_DAT_STRING = workbook.getWorksheet('AHL_DAT_STRING');
        

       json_data.forEach(elementDate => { // gre cez use datume
            let datum = elementDate.datum;
            
           //    console.log(workAHL_DAT_STRING.getRow(3).getCell(1).value);
          //  workAHL_DAT_STRING.getRow(3).getCell(1).value = JSON.stringify(elementDate.lokacije);
            //console.log(JSON.stringify(elementDate.lokacije));

            elementDate.lokacije.forEach(lokacije => { //gre cez use lokacije določen datum
                let lokacija = lokacije.lokacija;
                let liga = lokacije.liga;
                let sodniki = lokacije.sodniki; 
               
                //za nafilat
               
                let sestavljenString='';
                if(liga == "AHL"){

                    sestavljenString+=lokacija;
                    var i;
                    for(i=0; i<4; i++){
                        sestavljenString+=";"+sodniki[i].ime;
                    }

                    let cellDate = vrniCellOdDatuma(workAHL_DAT_STRING,datum);
                    let rowDate = vrniRowOdDatuma(workAHL_DAT_STRING,cellDate, lokacija)
                    if(workAHL_DAT_STRING.getRow(rowDate).getCell(cellDate).value == null){
                        workAHL_DAT_STRING.getRow(rowDate).getCell(cellDate).value = sestavljenString;
                        let today= new Date();
                        fs.appendFileSync("logs/logs.txt", "[" + today + "] " + "Nov datum dodan v delegacije. Datum:"+datum+"\n" );             
                        
                    }else{
                        //poglej ce je kaksen sodnik zamenal in  ga prepisi
                        let str = workAHL_DAT_STRING.getRow(rowDate).getCell(cellDate).value.split(";");
                        var j;
                        for(j=0; j<4; j++){
                            if(sodniki[j].ime != str[j+1]){
                                console.log(sodniki[j].ime + "je zamenjal "+ str[j+1]);
                                let today= new Date();
                                fs.appendFileSync("logs/logs.txt", "[" + today + "] " + "Sodnik " + sodniki[j].ime + " uspesno zamenjal " + str[j+1] + " Lokacija: "+str[0] + ", Datum: "+datum+"\n" );             
                                
                            }
                        }
                        workAHL_DAT_STRING.getRow(rowDate).getCell(cellDate).value = sestavljenString;
                    }
                    
                    updateAhlSchema(datum,workAHL_DAT,workAHL_DAT_STRING);
                
                }
                else{
                    //ebel
                }                
            })
            workbook.xlsx.writeFile('data/AHLdelegacije.xlsx');           
        })
        }
       
        );

}

function updateAhlSchema(datum1,ahl_dat, ahl_dat_string){
    let cell = vrniCellOdDatuma(ahl_dat_string,datum1);
    if(ahl_dat.getRow(3).getCell(cell).value == null){
        ahl_dat.getRow(3).getCell(cell).value = datum1;
        let today= new Date();
        fs.appendFileSync("logs/logsNovDatum.txt", "[" + today + "] " + "Nov datum dodan v AHL_DAT. Datum:"+datum1+"\n" );             
        console.log("Nov datum dodan v AHL_DAT shemo");
    }

    let countRow=4;
    let countRowS=4;
    while(ahl_dat_string.getRow(countRowS).getCell(cell).value != null){

        let str = ahl_dat_string.getRow(countRowS).getCell(cell).value.split(";");
        var l;
        for(l=1; l<5; l++){
            ahl_dat.getRow(countRow).getCell(cell).value= null;
            ahl_dat.getRow(countRow).getCell(cell).value = str[l];
            countRow++;           
        }
        countRowS++;       
    }
}

function vrniCellOdDatuma(worksheet,datum){

    let countCell = 1;
    while(1){
        if(worksheet.getRow(3).getCell(countCell).value == datum){
            return countCell;
        }
        if(worksheet.getRow(3).getCell(countCell).value == null ){
            worksheet.getRow(3).getCell(countCell).value=datum;
            return countCell;
        }
        countCell ++;
    }
    return countCell;

};
function vrniRowOdDatuma(worksheet,countCell, hala){

    let countRow = 4;
    while(1){

        if(worksheet.getRow(countRow).getCell(countCell).value == null ){
            
            return countRow;
        }
        else{ 
            let hh = worksheet.getRow(countRow).getCell(countCell).value
            let str = hh.split(";");
            if(str[0] == hala){

            return countRow;
            }
        }
        
        countRow ++;
    }
    return countRow;

};

