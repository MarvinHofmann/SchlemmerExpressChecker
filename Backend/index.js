const express = require("express");

const app = express();
exports.app = app;
const port = 4545;

const axios = require('axios');

//Init Body Parser
let bodyParser = require("body-parser");
app.use(bodyParser.json());

//App Listen
app.listen(port, () => {
    //leds.workLight();
    //Rolladen.rolladenUP();
    console.log(`App listening at http://192.168.0.138:${port}`);
    console.log(process.env.MAIL_USER)
});

const dotenv = require("dotenv");
dotenv.config();

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let cors = require('cors');
app.options('*', cors())
app.use(cors())

const searchText = "Tickets folgen in Kürze"
const adresseLuna = "https://lumagica.com/de/standorte/meran#intro"
let MAILSEND = false

async function fetchMordImSchlemmerExpress() {
    let position;
    let foundText = false;
    let change = false;
    await axios.get(adresseLuna, { responseType: 'document' }).then(function (response) {
        let text = response.data;
        position = text.search(searchText);
        console.log(position)
        const dom = new JSDOM(response.data)
        let strongs = dom.window.document.querySelectorAll("span");
        strongs.forEach((strong) => {
            console.log(strong.innerHTML)
            if (strong.innerHTML == searchText) {
                foundText = true;
            }
        });

        if (position != 4600 || foundText == false) {
            console.log("ALERT Mord im Express", searchText,dom, strongs);
            if (!MAILSEND) {
                sendMail("marvin@raithweg15.de")
                //sendMail("michihofmann73@web.de")
            }
            change = true
        }
        console.log("Lunamagica > pos: " + position + " Gefunden: " + foundText + " Änderung: " + change);

    })
        .catch(function (error) {
            console.log("Erroro fetching" + error);
        });
    return { type: "Mord", position: position, foundText: foundText, change: change }
}

async function fetchImSchlemmerExpress() {
    let position;
    let foundText = false;
    let change = false
    await axios.get(adresseNorm, { responseType: 'document' }).then(function (response) {
        let text = response.data;
        position = text.search(searchText);
        const dom = new JSDOM(response.data)
        let strongs = dom.window.document.querySelectorAll("strong");
        strongs.forEach((strong) => {
            if (strong.innerHTML == searchText) {
                foundText = true;
            }
        });

        if (position != 101215 || foundText == false) {
            console.log("ALERT normaler Express");
            if (!MAILSEND) {
                sendMail("marvin@raithweg15.de")
                sendMail("michihofmann73@web.de")
            }
            change = true
        }
        console.log("Schlemmerexpress (Norm) > pos: " + position + " Gefunden: " + foundText + " Änderung: " + change);

    })
        .catch(function (error) {
            console.log("Erroro fetching" + error);
        });
    return { type: "Normal", position: position, foundText: foundText, change: change }
}


app.get("/checkPages", async function (req, res) {
    let res0 = await fetchMordImSchlemmerExpress()
    let res1 = { type: "Normal", position: "1", foundText: false, change: false } //await fetchImSchlemmerExpress()
    res.status(200).send({ res0, res1 })
});


/*********************** CRON ******************************** */
const CronJob = require('cron').CronJob;
//Begonnen am 1.4.2022 4:30
const job = new CronJob('*/1 * * * *', function () {
    console.log('JOB DONE');
    //fetchImSchlemmerExpress()
    fetchMordImSchlemmerExpress()
});
job.start();


/*********************** MAIL ******************************** */
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: 'smtp.gmx.de',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

async function sendMail(mail) {
    console.log("sendMail to: " + mail);
    const htmlToSend = '<strong>Änderungen erkannt</strong>\n<a href="https://lumagica.com/de/standorte/meran#intro">LUMAGICA Meran</a>\n'
    transporter.sendMail({
        from: '"LUMAGICA checker" <aramrule.checker@gmx.de>',
        to: mail,
        subject: "❌ Änderung erkannt - Meran ❌",
        html: htmlToSend,
    });
    MAILSEND = true;
}