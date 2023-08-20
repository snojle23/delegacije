"use strict";

const http = require('http');
const fs = require('fs');

async function getNewJson(){
    const req = http.get("http://delegacije.sinusiks.net/ext/ahl-ebel.php", async function(res){
        
            let data = '',
            json_data_url;
        
            res.on('data', function(stream) {
                data += stream;
            });
            res.on('end', function() {
                try{
                    json_data_url = JSON.parse(data);
                const ena = magic(json_data_url);
                return ena;
                }
                catch{
                    console.log("Ne morem parsat jsona iz URLja");
                }
                
            });
        });
        
        req.on('error', function(e) {
            console.log(e.message);
        });
        return "done";

}

function magic(json_data_url){
    const fileBefore = JSON.parse(fs.readFileSync("json/tekme.json", 'utf8'));
    fs.writeFileSync("json/tekme.json",'[]');
    let json_tekme = [];
        json_data_url.forEach(element => {
            //console.log(p);
            preveriJson(element.referee, element.location, element.date,element.competition,json_tekme);
        });

    if(json_tekme !== fileBefore){
        console.log("    "+"brez sprememb")
    }
    fs.writeFileSync("json/tekme.json",JSON.stringify(json_tekme),(err) => {
        if (err) throw err;
        console.log('The file has not been saved!');
    });
    };

function preveriJson(sodnik, lokacija, datum, liga, json_tekme){
    let check = 0;
    json_tekme.forEach(datumJson => {
        
        if (datumJson.datum == datum){
            let check2=0;
            datumJson.lokacije.forEach( loka => {
                if(loka.lokacija == lokacija && loka.liga === liga){
                    let sudija={ime:sodnik};
                    loka.sodniki.push(sudija);
                    check2=1;
                    return;
                }
            });
            if(check2 == 0){
                let sodniki={ime:sodnik};
                let lok = {lokacija:lokacija,liga:liga, sodniki:[sodniki]}
                datumJson.lokacije.push(lok);
            }
            check = 1;
            return json_tekme;
        }       
    });
    if(check == 0){
    //dodaj nov datum
        let sodniki={ime:sodnik};
        let lok = {lokacija:lokacija,liga:liga, sodniki:[sodniki]}
        let novDatum={datum:datum,lokacije:[lok]};

        json_tekme.push(novDatum);   
    }
    return json_tekme;

}

module.exports = {getNewJson, magic};