const exceljs = require('exceljs');
const fs = require('fs')


	 function odpriExcel() {
        var workbook = new exceljs.Workbook();
        
        workbook.xlsx.readFile('data/AHLdelegacije.xlsx').then(workbook =>{

            
        
            let worksheet = workbook.getWorksheet('AHL');
            
            var count = 1;   
            let countGSlo =0;
            let countLSlo = 0;
            
            let countGAu =0;
            let countLAu = 0;
            let holzer = 0;
            let huber = 0;
            let brata = 0;
            
            let countGIta =0;
            let countLIta = 0;
             while(worksheet.getRow(3).getCell(count).value != null){
                   
                if(worksheet.getRow(1).getCell(count).value == "slo" ){
                    if(worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FFFF0000"){
                        countGSlo+=worksheet.getRow(2).getCell(count).value.result;
                    }
                    else if(worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FF00B0F0"){
                        countLSlo+=worksheet.getRow(2).getCell(count).value.result;
                        
                    }
                }
                else if(worksheet.getRow(1).getCell(count).value == "au" ){
                    if(worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FFFF0000"){
                        countGAu+=worksheet.getRow(2).getCell(count).value.result;
                    }
                    else if(worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FF00B0F0"){
                        countLAu+=worksheet.getRow(2).getCell(count).value.result;
                    }

                }
                else if(worksheet.getRow(1).getCell(count).value == "ita" ){
                    if(worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FFFF0000"){
                        countGIta+=worksheet.getRow(2).getCell(count).value.result;
                      //  console.log(countGlavniIta);
                    }
                    else if(worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FF00B0F0"){
                        countLIta+=worksheet.getRow(2).getCell(count).value.result;
                    }
                    else if(worksheet.getRow(3).getCell(count).value = "GIACOMOZZI"){
                        brata += worksheet.getRow(2).getCell(count).value.result;
                    }
                }
                else if(worksheet.getRow(1).getCell(count).value == "au?"){
                    if(worksheet.getRow(3).getCell(count).value == "HOLZER"){
                        
                        holzer += worksheet.getRow(2).getCell(count).value.result;
                    }
                    else if(worksheet.getRow(3).getCell(count).value == "HUBER"){
                        huber += worksheet.getRow(2).getCell(count).value.result;
                    }
                }
                else if(count >200){
                    return 1;
                    
                }
                count++;
               
            }
            console.log("Glavni slo: "+ countGSlo);
            console.log("Linijski slo: "+ countLSlo);
            console.log("Glavni Au: "+ countGAu);
            console.log("Linijski Au: "+ countLAu);
            console.log("Glavni Ita: "+ countGIta);
            console.log("Linijski Ita: "+ countLIta);
            console.log("HOLzer :" + holzer);
            console.log("huber :" + huber);
            console.log("giacomozi :" + brata);
            console.log("vsi glavni " + (countGAu + countGIta + countGSlo))
            console.log("vsi liniski "+ (countLAu + countLIta +countLSlo) )
            let vsi = countLAu + countLIta +countLSlo +countGAu + countGIta + countGSlo;
            let tekm = vsi / 4 ;

            console.log (vsi + " tekm : "+tekm)
            console.log ( (countLSlo+ countGSlo) /437);
            console.log ( (countLAu+ countGAu) /437);
            console.log ( (countLIta+ countGIta) /437);
        }
            )

 
    }



   odpriExcel();

   