const { delegacije } = require('./delegacije');
const fs = require('fs')
const { getNewJson, magic } = require('./getNewJson');
const { getData2 } = require('./getNewData')
const nodemailer = require("nodemailer");
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({ // 'ICEObvescanje1'
    service: 'gmail',
    auth: {
        user: 'delegacijeice@gmail.com',
        pass: 'eduainbjitlfxdma'
    }
});
let counter = 1;
let countHour = 0;
scheduledFunction();


function scheduledFunction() {
    setInterval(async function () {
        const today = new Date();
        // console.log("1. Pridobivam nove podatke, poizkus " + counter + " " + today);
        // const mess = await getNewJson();
        //await sleep(5000);
        //console.log("  " + mess);
        //const json_data = JSON.parse(fs.readFileSync("json/tekme.json", 'utf8'));

        const json_data = await getData2();

        if (json_data.length > 0) {
            // console.log(json_data);
            const arrayForMail = [];
            // console.log("2. klicem delegaije.js");
            await delegacije(json_data, arrayForMail);

            // console.log("3. klicem delegaije.js");
            // await delegacije(json_data, arrayForMail);

            // console.log("4. klicem delegaije.js");
            // await delegacije(json_data, arrayForMail);


            // // POSLJI MAIL
            // if (arrayForMail.length > 0) {
            //     console.log('posiljam mail');
            // } else {
            //     console.log("-------------------------------------------------------------------")
            // }
            const mailing = {
                "snoj": "tadej.snoj@gmail.com",
                "bajt": "miha.bajt@gmail.com",
                "miklic": "gregor.miklic.sp@gmail.com",
                "rezek": "gregor.rezek@gmail.com",
                "hribar": "matjazhribar@hotmail.com",
                "zrnic": "milan_zrnic@hotmail.com",
                "trilar": "viki@hokej.si",
                "zgonc": "jaka.zgonc@gmail.com",
                "bergant": "anze.bergant@gmail.com",
                "bulovec": "miha.bulovec@gmail.com",
                "piragic": "trpimir.piragic@gmail.com",
                "seewald": "seewald30@gmail.com"
            }
            arrayForMail.forEach(i => {
                const tekme = JSON.stringify(i.tekme);
                if (Object.keys(mailing).includes(i.sodnik)) {
                    const mailOptions = {
                        from: 'delegacijeice@gmail.com',
                        to: mailing[i.sodnik],
                        subject: `New game AHL/ICEHL`,
                        text: `New games: ${tekme}`
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response + "to " + i.sodnik);
                            console.log(tekme)
                            console.log("----------------------------------")
                        }
                    });
                }
            });
        }
        countHour++
        if (countHour === 120) {
            const today = new Date();
            console.log('');
            console.log("Še ena ura je šla mimo. Skupen stevec: " + counter + " datum:" + today);
            countHour = 0;
        } else {
            process.stdout.write(`\rProgress: ${(countHour / 120 * 100).toFixed(2)}%`);
        }

        counter++;
    }, 1 * 1 * 30 * 1000); // 1 hour = 1 * 60 * 60 * 1000
}       // 1 * 1 * 30 * 1000 30sec

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}