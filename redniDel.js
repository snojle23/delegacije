const exceljs = require('exceljs');
const fs = require('fs')


function odpriExcel() {
    var workbook = new exceljs.Workbook();

    workbook.xlsx.readFile('data/AHLdelegacije - Konec rednega.xlsx').then(workbook => {
        let worksheet = workbook.getWorksheet('AHL');

        var count = 1;
        let countGSlo = 0;
        let countLSlo = 0;

        //zard tega k ma Julija eno kot glavni
        let countGAu = 1;
        let countLAu = -1;
        let countGIta = 0;
        let countLIta = 0;
        let reisiG;
        let reisiL;

        let stGlavnihSlo=0;
        let stLinijaSlo=0;
        console.log('\n'+ "---------------------------------------------------------"+'\n');
        while (worksheet.getRow(3).getCell(count).value != null) {

            if (worksheet.getRow(1).getCell(count).value == "slo") {
                if (worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FFFF0000") {
                    countGSlo += worksheet.getRow(2).getCell(count).value.result;
                    stGlavnihSlo++;
                    console.log(worksheet.getRow(3).getCell(count).value+ '\t' + " stevilo tekem: "+ '\t' +worksheet.getRow(2).getCell(count).value.result)
                }
                else if (worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FF00B0F0") {
                    countLSlo += worksheet.getRow(2).getCell(count).value.result;
                    stLinijaSlo++;
                    console.log(worksheet.getRow(3).getCell(count).value+'\t' + " stevilo tekem: "+ '\t' +worksheet.getRow(2).getCell(count).value.result)
                }
            }
            else if (worksheet.getRow(1).getCell(count).value == "au") {
                if (worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FFFF0000") {
                    countGAu += worksheet.getRow(2).getCell(count).value.result;
                }
                else if (worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FF00B0F0") {
                    countLAu += worksheet.getRow(2).getCell(count).value.result;
                }
                else if( worksheet.getRow(3).getCell(count).value = "REISINGER"){
                    const vrni = prestej(worksheet, count);
                    reisiG = vrni.glavni;
                    reisiL = vrni.linic;
                    console.log("g:",reisiG,"L",reisiL);
                }
            }
            else if (worksheet.getRow(1).getCell(count).value == "ita") {
                if (worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FFFF0000") {
                    countGIta += worksheet.getRow(2).getCell(count).value.result;
                    //  console.log(countGlavniIta);
                }
                else if (worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FF00B0F0") {
                    countLIta += worksheet.getRow(2).getCell(count).value.result;
                }
            }
            else if (count > 200) {
                return 1;

            }
            count++;

        }
        const vsiAvstriciGlavni = (countGAu + reisiG -1);
        const vsiAvstriciLiniski = (countLAu + reisiL);
        const vsiItaljaniGlavni = (countGIta );
        const vsiItaljaniLinici = (countLIta );
        const vsiGlavni = (vsiAvstriciGlavni + vsiItaljaniGlavni + countGSlo);
        const vsiLinici = (vsiAvstriciLiniski + vsiItaljaniLinici + countLSlo)

        console.log('\n'+ "---------------------------------------------------------"+'\n');
        console.log("Slovenci: Glavni: " + countGSlo+" Linijski: " + countLSlo);
        console.log("St glavnih slo: " + stGlavnihSlo + '\n' +"st linicov: "+ stLinijaSlo );
        console.log('\n'+ "---------------------------------------------------------"+'\n');
        console.log("Avstrici: Glavni: " + vsiAvstriciGlavni+" Linijski: " + vsiAvstriciLiniski);
        console.log('\n'+ "---------------------------------------------------------"+'\n');
        console.log("Italjani: Glavni: " + vsiItaljaniGlavni+" Linijski : " + vsiItaljaniLinici );
        console.log( "---------------------------------------------------------");
        console.log("vsi glavni " +'\t' + vsiGlavni)
        console.log("vsi liniski " + '\t' +vsiLinici)
        let vsi = vsiAvstriciLiniski + vsiItaljaniLinici + countLSlo + vsiAvstriciGlavni + vsiItaljaniGlavni + countGSlo;
        let delegacije = vsi / 4;

        console.log("delegacij "+'\t'+ vsi +  '\n'+"tekem: "+'\t' +'\t' + delegacije)
        console.log("---------------------------------------------------------"+'\n');
        console.log("slovenci: " +'\t' + (countLSlo + countGSlo) / vsi);
        console.log("Liniski proc.:"+ '\t' +(countLSlo)/vsiLinici);
        console.log("Glavni procent:"+ '\t' +(countGSlo)/vsiGlavni);
        console.log( "---------------------------------------------------------");
        console.log("avstici " + '\t' +(vsiAvstriciLiniski + vsiAvstriciGlavni) / vsi);
        console.log( "---------------------------------------------------------");
        console.log("italjani " +'\t' +(vsiItaljaniGlavni + vsiItaljaniLinici) / vsi);
        console.log( "---------------------------------------------------------");
    }
    )
}



odpriExcel();
function prestej(work, cell) {
    let row = 4
    let linic = 0;
    let glavni = 0;
    while (work.getRow(row).getCell(cell).value != null) {
        if (work.getRow(row).getCell(cell).fill.fgColor.argb == "FF00B0F0") {
            linic++;
        }
        else {
            glavni++;
        }

        row++;
    }
    return {
        linic: linic,
        glavni: glavni
    }
}
