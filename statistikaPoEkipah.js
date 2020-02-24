const exceljs = require('exceljs');
const { vrniCellSodnik } = require("./vrniCellSodnik");
const excel = 'data/AHLdelegacijeUmesni.xlsx';
const {prestej} = require('./slo');

let master = [];
let a = [];
let b = [];
let sloSodniki = [
    {
        ime: "SNOJ",
        master: 0,
        secondA: 0,
        secondB: 0
    },
    {
        ime: "REZEK",
        master: 0,
        secondA: 0,
        secondB: 0
    },
    {
        ime: "PAHOR",
        master: 0,
        secondA: 0,
        secondB: 0
    },
    {
        ime: "LESNIAK",
        master: 0,
        secondA: 0,
        secondB: 0
    },
    {
        ime: "FAJDIGA",
        master: 0,
        secondA: 0,
        secondB: 0
    },
    {
        ime: "BAJT",
        master: 0,
        secondA: 0,
        secondB: 0
    },
    {
        ime: "MARKIZETI",
        master: 0,
        secondA: 0,
        secondB: 0
    },
    {
        ime: "JAVORNIK",
        master: 0,
        secondA: 0,
        secondB: 0
    },
    {
        ime: "BERGANT",
        master: 0,
        secondA: 0,
        secondB: 0
    },
    {
        ime: "MIKLIC",
        master: 0,
        secondA: 0,
        secondB: 0
    },
    {
        ime: "BULOVEC",
        master: 0,
        secondA: 0,
        secondB: 0
    }
];
let vsiSodniki = [];

statistika();

function statistika() {
    var workbook = new exceljs.Workbook();

    workbook.xlsx.readFile(excel).then(workbook => {
    
        let worksheet = workbook.getWorksheet('AHL_DAT_STRING');
        let sudija = workbook.getWorksheet('AHL');
        getAllNames(sudija);
        let count = 1;
        // cez use datume
        while (worksheet.getRow(3).getCell(count).value != null) {
            //cez use tekme
            let countRow=4
            while(worksheet.getRow(countRow).getCell(count).value != null){
                let s = worksheet.getRow(countRow).getCell(count).value;
                procesirajPodatke(s);
                countRow++;
            }
            count++;
        }
        console.log('\n'+'\n'+'\n'+ "---------------------------------------------------------"+'');
        console.log(''+ "---------------------------------------------------------"+'');
        console.log(''+ "---------------------------------------------------------"+'\n');
        izpisi(sudija);
        dodatnaStatistika(sudija);
    });
};

//input je ena tekma
function procesirajPodatke(input){
    let razbito = input.split(";");
    const imeHale = razbito[0];
    if(hale[imeHale] == 1){
        master.push(razbito[1]);
        master.push(razbito[2]);
        master.push(razbito[3]);
        master.push(razbito[4]);
    }
    else if(hale[imeHale] == 2){
        a.push(razbito[1]);
        a.push(razbito[2]);
        a.push(razbito[3]);
        a.push(razbito[4]);
    }
    else if(hale[imeHale] == 3){
        b.push(razbito[1]);
        b.push(razbito[2]);
        b.push(razbito[3]);
        b.push(razbito[4]);
    }
    else {
        console.log(imeHale);
    }
}
//1 -> prva Master grupa, 2-> A grupa, 3 -> B grupa
const hale = {
    "Eisarena Salzburg" : 2,
    "Eishalle Feldkirch": 3,
    "Eishalle Lustenau": 2,
    "Eishalle Sterzing": 2,
    "KeineSorgen EisArena": 3,
    "Hala Tivoli": 1,
    "Eishalle Dornbirn": 3,
    "Eishalle Zell am See": 3,
    "Eishalle Bruneck": 1,
    "Eishalle Ritten": 1,
    "Klagenfurter Stadthalle": 2,
    "Eishalle Wien Kagran": 2, //Viena
    "Eishalle Jesenice": 1,
    "Sportpark Kitzbühel": 3,
    "Eishalle Gröden": 2,
    "Eishalle Asiago": 1,
    "Eishalle Cortina": 1,
    "Eishalle Canazei": 3,

    "Eishalle Wien-Kagran": 2, //viena
    "Eissporthalle Linz": 3,
    "Dornbirn Messestadion": 3,
    "Feldkirch Vorarlberghalle": 2,
    "Lustenau Rheinhalle": 2,
    "Pala Hodegart": 1,
    "Stadio Olympico": 1,
    "Pranives Wolkenstein": 2,
    "Arena Ritten": 1,
    "Ledena dvorana Podmežakla": 1,
    "Rienzstadion Bruneck": 1,
    "Weihenstephan Arena": 2,
    "Stadio del Ghiaccio Gianmario Scola": 3,
    "Klagenfurt Stadthalle": 2,
    "Kitzbühel Sportpark": 3,
    "Hala Tivoli Ljubljana": 1,
    "KeineSorgenEisarena": 3,
    "ASH": 1
}

function izpisi(worksheet){
    let masterAut = 0;
    let masterSlo = 0;
    let masterIta = 0;

    let secondAut = 0;
    let secondSlo = 0;
    let secondIta = 0;

    master.forEach(imeSodnika => {

        const cell = vrniCellSodnik(worksheet, imeSodnika);
        const drzava = worksheet.getRow(1).getCell(cell).value;
        prestejVse(imeSodnika, "master")
        if(drzava == "slo"){
            masterSlo++;
            prestejSlo(imeSodnika, "master");
        }
        if(drzava == "ita"){
            masterIta++;
        }
        if(drzava == "au" || drzava == "au?"){
            masterAut++;
        }
        
    });

    a.forEach(imeSodnika => {

        const cell = vrniCellSodnik(worksheet, imeSodnika);
        const drzava = worksheet.getRow(1).getCell(cell).value;
        prestejVse(imeSodnika, "secondA")
        if(drzava == "slo"){
            secondSlo++;
            prestejSlo(imeSodnika, "secondA");
        }
        if(drzava == "ita"){
            secondIta++;
        }
        if(drzava == "au" || drzava == "au?"){
            secondAut++;
        }
    });

    b.forEach(imeSodnika => {
        const cell = vrniCellSodnik(worksheet, imeSodnika);
        const drzava = worksheet.getRow(1).getCell(cell).value;
        prestejVse(imeSodnika, "secondB")
        if(drzava == "slo"){
            secondSlo++;
            prestejSlo(imeSodnika, "secondB");
        }
        if(drzava == "ita"){
            secondIta++;
        }
        if(drzava == "au" || drzava == "au?"){
            secondAut++;
        }
    });

    const masterAll = masterAut + masterIta + masterSlo;
    const secondAll = secondIta + secondAut + secondSlo;

    console.log("\n");
    console.log("-------------MASTER-------------");
    console.log("slovenci: "+ masterSlo + " procenti :" + (masterSlo/masterAll));
    console.log("avstrijci: " + masterAut + " procenti :" + (masterAut/masterAll));
    console.log("italjani: " + masterIta + " procenti :" + (masterIta/masterAll))

    console.log("\n");
    console.log("-------------SECOND TWO-------------");
    console.log("slovenci: "+ secondSlo + " procenti :" + (secondSlo/secondAll));
    console.log("avstrijci: " + secondAut + " procenti :" + (secondAut/secondAll));
    console.log("italjani: " + secondIta + " procenti :" + (secondIta/secondAll))
    console.log("\n");
    console.log(sloSodniki);
    console.log("-------------VSI SODNIKI-------------");
    console.log(vsiSodniki);
}


function prestejSlo(imeSodnika, grupa){
    const s = sloSodniki.findIndex(i => i.ime === imeSodnika);
    if(grupa == "master"){
        sloSodniki[s].master +=1;
    }
    else if (grupa === "secondA"){
        sloSodniki[s].secondA +=1;
    }
    else if (grupa === "secondB"){
        sloSodniki[s].secondB +=1;
    }
    
}
function prestejVse(imeSodnika, grupa){
    const s = vsiSodniki.findIndex(i => i.ime === imeSodnika);
    if(grupa == "master"){
        vsiSodniki[s].master +=1;
    }
    else if (grupa === "secondA"){
        vsiSodniki[s].secondA +=1;
    }
    else if (grupa === "secondB"){
        vsiSodniki[s].secondB +=1;
    }
    
}
function dodatnaStatistika(worksheet) {

        var count = 1; //stevec za stet po excelu
        let countGSlo = 0;
        let countLSlo = 0;


        let countGAu = 0;
        let countLAu = 0;
        let holzerL;
        let holzerG;
        let huberG;
        let huberL;
        let brataG;
        let brataL;
        let countGIta = 0;
        let countLIta = 0;

        let stGlavnihSlo=0;
        let stLinijaSlo=0;
        console.log('\n'+ "---------------------------------------------------------"+'\n');
        console.log('\n'+ "---------------------------------------------------------"+'\n');
        while (worksheet.getRow(3).getCell(count).value != null) {

            if (worksheet.getRow(1).getCell(count).value == "slo") {
                if (worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FFFF0000") {
                    let r = worksheet.getRow(2).getCell(count).value.result || 0;
                    countGSlo += r;
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
                    let r = worksheet.getRow(2).getCell(count).value.result || 0;
                    countGAu += r;
                }
                else if (worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FF00B0F0") {
                    let r = worksheet.getRow(2).getCell(count).value.result || 0;
                    countLAu += r;
                }
            }
            else if (worksheet.getRow(1).getCell(count).value == "ita") {
                if (worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FFFF0000") {
                    countGIta += worksheet.getRow(2).getCell(count).value.result;
                    //  console.log(countGlavniIta);
                }
                else if (worksheet.getRow(3).getCell(count).fill.fgColor.argb == "FF00B0F0") {
                    let r = worksheet.getRow(2).getCell(count).value.result || 0;
                    countLIta += r;
                }
                else if (worksheet.getRow(3).getCell(count).value = "GIACOMOZZI") {
                    const vrni = prestej(worksheet, count);
                    brataG = vrni.glavni || 0;
                    brataL = vrni.linic || 0;
                }
            }
            else if (worksheet.getRow(1).getCell(count).value == "au?") {
                if (worksheet.getRow(3).getCell(count).value == "HOLZER") {

                    const vrni = prestej(worksheet, count);
                    holzerG = vrni.glavni || 0;
                    holzerL = vrni.linic || 0;

                }
                else if (worksheet.getRow(3).getCell(count).value == "HUBER") {

                    const vrni = prestej(worksheet, count);
                    huberG = vrni.glavni || 0;
                    huberL = vrni.linic || 0;
                }
            }
            else if (count > 200) {
                return 1;

            }
            count++;

        }
        const vsiAvstriciGlavni = (countGAu  +holzerG + huberG);
        const vsiAvstriciLiniski = (countLAu  +holzerL + huberL);
        const vsiItaljaniGlavni = (countGIta + brataG);
        const vsiItaljaniLinici = (countLIta + brataL);
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
        let stTekem = vsi / 4;

        console.log("delegacij "+'\t'+ vsi +  '\n'+"tekem: "+'\t' +'\t' + stTekem)
        console.log("---------------------------------------------------------"+'\n');
        console.log("slovenci: " +'\t' + (countLSlo + countGSlo) / vsi);
        //console.log("Liniski proc.:"+ '\t' +(countLSlo)/vsiLinici);
        //console.log("Glavni procent:"+ '\t' +(countGSlo)/vsiGlavni);
        console.log( "---------------------------------------------------------");
        console.log("avstici " + '\t' +(vsiAvstriciLiniski + vsiAvstriciGlavni) / vsi);
        console.log( "---------------------------------------------------------");
        console.log("italjani " +'\t' +(vsiItaljaniGlavni + vsiItaljaniLinici) / vsi);
        console.log( "---------------------------------------------------------");
}
function getAllNames(worksheet){
    let count =1;
    while (worksheet.getRow(3).getCell(count).value != null) {
            const obj = {
                    ime: worksheet.getRow(3).getCell(count).value,
                    master: 0,
                    secondA: 0,
                    secondB: 0
                }
            vsiSodniki.push(obj);
        count ++;
    }
}