const exceljs = require('exceljs');
const fs = require('fs')


	async function odpriExcel() {
        var workbook = new exceljs.Workbook();
        workbook = await workbook.xlsx.readFile('AHLdelegacije.xlsx');
        
        var worksheet = workbook.getWorksheet('AHL');
        var count = 1;   
         while(1){

                if(worksheet.getRow(1).getCell(count).value == "slo" ){
                    console.log("sodnik " + worksheet.getRow(3).getCell(count).value + " tekm: " + worksheet.getRow(2).getCell(count).value.result );
                    
                }
            else if(count >200){
                return;
            }
            count++;
        }

       
    }

   odpriExcel();

   