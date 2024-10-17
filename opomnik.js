
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
    ["tadej.snoj@gmail.com", "grega.markizeti@gmail.com", "matjazhribar@hotmail.com"].forEach(i => {
        let htmlTekst = `
    <p><strong>>New games in https://www.referee-manager-nisi-prnesu-piva.com/, check them:</p>
    <br></br>
    `;
        const mailOptions = {
            from: 'delegacijeice@gmail.com',
            to: i,
            subject: `New game AHL/ICEHL`,
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