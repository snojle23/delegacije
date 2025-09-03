
const nodemailer = require("nodemailer");
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({ // 'ICEObvescanje1'
    service: 'gmail',
    auth: {
        user: 'delegacijeice@gmail.com',
        pass: 'eduainbjitlfxdma'
    }
});

opomnik();
function opomnik() {
    // "grega.markizeti@gmail.com", "petja.murnik@gmail.com", "milan_zrnic@hotmail.com", "matjazhribar@hotmail.com", "trpimir.piragic@gmail.com", 
    ["tadej.snoj@gmail.com", "gregor.rezek@gmail.com", "milan_zrnic@hotmail.com", , "trpimir.piragic@gmail.com"].forEach(i => {
        let htmlTekst = `
    <p><strong>Če si dobil ta mail pomeni, da mi je dolgčas na šihtu. Aja, pa si eden izmed 3 ljudi, ki za sezono 24-25 še nisi prinesel sixpacka (ali 1l rakije - kar mi je ljubše #problemiAlkoholika) </p>
    <br></br>
    `;
        const mailOptions = {
            from: 'delegacijeice@gmail.com',
            to: i,
            subject: `Kva dogaja`,
            html: htmlTekst
            //text: `Program is back on!\nWelcome to the season 2023-24!.\n\n Please do not forget for yearly subscription of one six-pack for season 2022-23 :) \n\n here are new games for you: ${tekme}`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Opomnik: ' + i);
            }
        });
    })
}