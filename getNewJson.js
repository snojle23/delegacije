"use strict";

const http = require('http');
const fs = require('fs');

  const getNewJson = function(){
    let req = http.get("http://delegacije.sinusiks.net/ext/ahl-ebel.php", function(res){
        
            let data = '',
            json_data_url;
        
            res.on('data', function(stream) {
                data += stream;
            });
            res.on('end', function() {
                json_data_url = JSON.parse(data);
                const ena = magic(json_data_url);
                return ena;
            });
        });
        
        req.on('error', function(e) {
            console.log(e.message);
        });
    }

function magic(json_data_url){
    //
    fs.writeFileSync("json/tekme.json",'[]');
    let json_tekme=JSON.parse(fs.readFileSync("json/tekme.json",'utf8'));
   
     
        json_data_url.forEach(element => {
            //console.log(p);
           json_tekme = preveriJson(element.referee, element.location, element.date,element.competition,json_tekme);
        });
        fs.writeFileSync("json/tekme.json",JSON.stringify(json_tekme),(err) => {
            if (err) throw err;
            console.log('The file has been saved!');
            
          });
          
    };

function preveriJson(sodnik,lokacija,datum,liga,json_tekme){
    let check = 0;
    json_tekme.forEach(datumJson => {
        
        if (datumJson.datum == datum){
            let check2=0;
            datumJson.lokacije.forEach( loka => {
                if(loka.lokacija == lokacija){
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

module.exports = getNewJson;