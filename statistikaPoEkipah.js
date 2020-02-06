const exceljs = require('exceljs');
const { vrniCellSodnik } = require("./vrniCellSodnik");
const excel = 'data/AHLdelegacijeUmesni.xlsx';

let master = [];
let a = [];
let b = [];

statistika();

function statistika() {
    var workbook = new exceljs.Workbook();

    workbook.xlsx.readFile(excel).then(workbook => {
    
        let worksheet = workbook.getWorksheet('AHL_DAT_STRING');
        let sudija = workbook.getWorksheet('AHL');
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
        izpisi(sudija);
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
}

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
]
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