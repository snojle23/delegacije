"use strict";

const { preveriCeSodnikObstaja } = require("./preveriCeSodnikObstaja.1");
const { preveriAliObstajaDatum } = require("./preveriAliObstajaDatum");
const  noviJson  = require("./getNewJson.js");

const exceljs = require('exceljs');
const fs = require('fs')

noviJson();




function magic(json_data){
    let workbook = new exceljs.Workbook();
    workbook.xlsx.readFile('AHLdelegacije.xlsx')
    .then(workbook => {
        let workAHL = workbook.getWorksheet('AHL');
        let workAHL_DAT = workbook.getWorksheet('AHL_DAT');
        
            //await dodajNoveDatume(workbook,json_data);
    // let lol = await dodajNoveDatume(workAHL_DAT, json_data);
    // workbook.xlsx.writeFile('AHLdelegacije.xlsx');
        console.log("uspesno");
        json_data.forEach((element) => {
            if (element.competition == 'AHL'){
                //najdi sodikov cell
                let countRow = 4;
                    while(1){
                        //console.log(workAHL.getRow(countRow).getCell(countCell).value);
                        if(workAHL.getRow(countRow).getCell(countCell).value == null){
                            //shrani true(nov datum..bo dodan v sheet) false(ze obstaja)
                            let novDatum =  preveriAliObstajaDatum(workAHL_DAT,element.date);
                            if(!novDatum){
                                //preveri kdo je zamenjal in zamenjaj
                                //naji sodnika, kateri nima vec tekme
                                var cellDate = vrniCellOdDatuma(workAHL_DAT,element.date);
                                sodnikVAhlDat(json_data,workAHL_DAT,workAHL,element.referee,cellDate,element.date);
                                return;
                            }
                            else{
                                workAHL_DAT.getRow(countRow).getCell(countCell).value = element.date;                                
                                console.log("Za sodnika " + element.referee + " uspesno dodan datum " + element.date);
                                let today = new Date();
                                fs.appendFileSync("logs.txt", "[" + today + "] " + "Za sodnika " + element.referee + " uspesno dodan datum " + element.date + " [NOV]"+"\n" );             
                                return;
                            }
                        }
                        else if(workAHL_DAT.getRow(countRow).getCell(countCell).value == element.date){
                            console.log("navedeni datum za " + element.referee + " ze obstaja");
                            return;
                        }                        
                        countRow++;
                    }
                    workbook.xlsx.writeFile('AHLdelegacije.xlsx');
                    return;
                }
            //dodajNoveDatume(workbook,json_data);

        workbook.xlsx.writeFile('AHLdelegacije.xlsx');
            //ebel
            if (element.competition == 'EBEL'){
                let worksheet= woorkbook.getWorksheet('EBEL');
                let countCell = 1;
                
                while(1){

                    if(worksheet.getRow(3).getCell(countCell).value == null ){
                        worksheet.getRow(3).getCell(countCell).value = element.referee;
                        console.log("Nov sodnik dodan v bazo: " + element.referee);
                        return;
                    }
                    else if(worksheet.getRow(3).getCell(countCell).value == element.referee){
                        //preglej za tekme
                        let countRow = 4;
                        while(1){
                            //console.log(worksheet.getRow(countRow).getCell(countCell).value);
                            if(worksheet.getRow(countRow).getCell(countCell).value == null){
            
                                worksheet.getRow(countRow).getCell(countCell).value = element.date;
                                
                                console.log("Za sodnika " + element.referee + " uspesno dodan datum " + element.date);
                                let today= new Date();
                                fs.appendFileSync("logsEbel.txt", "[" + today + "] " + "Za sodnika " + element.referee + " uspesno dodan datum " + element.date +"\n" );
                                
                                
                                return;
                            }
                            else if(worksheet.getRow(countRow).getCell(countCell).value == element.date){
                                console.log("navedeni datum za " + element.referee + " ze obstaja");
                                return;
                            }

                        
                            countRow++;
                        }
                        countRow =2 ;
                        return;
                    }
                    
                    countCell++;
                }
                
                console.log(element.referee);
            }
            workbook.xlsx.writeFile('AHLdelegacije.xlsx');           
        })
        });
}





function sodnikVAhlDat(json_data1,workAHL_DAT,workAHL,refere,cellAHL,datum){
    let rowDate=4;
    while(1){
        let sodnik = workAHL_DAT.getRow(rowDate).getCell(cellAHL).value;
        if( sodnik == null ){
            return;
        }
        let tekma = preveriAliImaSodnikTekmo(json_data1,sodnik,datum);
            if( tekma == false){
            //zamenjaj sodnika AHL_DAT
            workAHL_DAT.getRow(rowDate).getCell(cellAHL).value = refere;
            console.log("Sodnik" + sodnik + "je dal tekmo" + refere );
           //zbrisi v ahl shemi
           zbrisiAhlShemi(workAHL,sodnik,datum);
           return;
        }
        rowDate++;
    }
}

//najdi sodnik
function zbrisiAhlShemi(workAHL,sodnikZbisi,datum){
    let rowSodnik=4;
    let countCellSodnik = preveriCeSodnikObstaja(workAHL,sodnikZbisi);
    while(1){
       if( workAHL.getRow(rowSodnik).getCell(countCellSodnik).value == datum ){
            workAHL.getRow(rowSodnik).getCell(countCellSodnik).value = 'zamenjano'; 
            console.log(sodnikZbisi + "izbrisan datum");
            return;
       }
       rowSodnik++;
    }

}

function dodajNoveDatume(worksheet,json){

  //    let worksheet= await workbook.getWorksheet('AHL_DAT');
    json.forEach(elementDatumi => {
        let countCell1=1;
        if (elementDatumi.competition == 'AHL'){
            while(1){
                    if(worksheet.getRow(3).getCell(countCell1).value == elementDatumi.date){
                       let caka = dodajVseSodnikePodDatum(worksheet, json, elementDatumi.date);
                        return;
                    }
                    else if(worksheet.getRow(3).getCell(countCell1).value == null){
                        worksheet.getRow(3).getCell(countCell1).value = elementDatumi.date;
                        let caka2 =  dodajVseSodnikePodDatum(worksheet,json,elementDatumi.date);
                        return;
                    }
                    countCell1++;
            }
    }});
}
function dodajVseSodnikePodDatum(worksheet,jsonSodnik,datum){

    let rowDatum=  vrniCellOdDatuma(worksheet,datum);
   
        jsonSodnik.forEach(element => {
            if(element.date == datum && element.competition == 'AHL'){                
                //dodaj sodnika uspod
                let row= 4;
                while(1){
                    if (worksheet.getRow(row).getCell(rowDatum).value == null){
                        worksheet.getRow(row).getCell(rowDatum).value = element.referee;
      
                        console.log("sodnik uspesno dodan na polje"+ row + "cell "+ rowDatum + "sodnik " + element.referee + " poljeEX: "+ worksheet.getRow(row).getCell(rowDatum).value);
                        return;

                    }
                    else if(worksheet.getRow(row).getCell(rowDatum).value == element.referee){
                     
                        return;
                    }
                    row++;

                }
                
            } 
        
    });


}

function preveriAliImaSodnikTekmo(json,sodnik,datum){
    let vrni = false;
    if(sodnik == null ){
        return true;
    }
    json.forEach(elementSodnik => {
        if(elementSodnik.date == datum && elementSodnik.referee == sodnik){
            vrni = true;
            return true;
        }
        
    });
    return vrni;
}
;

function vrniCellOdDatuma(worksheet,datum){

    let countCell = 1;
    while(1){
        if(worksheet.getRow(3).getCell(countCell).value == datum){
            return countCell;
        }
        if(worksheet.getRow(3).getCell(countCell).value == null ){

            return -1;
        }
        countCell ++;
    }
    return countCell;

};

