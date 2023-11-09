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
    console.log(`App listening at http://ZimmerMatic:${port}`);
});

const dotenv = require("dotenv");
dotenv.config();

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let cors = require('cors');
app.options('*', cors())
app.use(cors())

const searchText = "Termine 2024 in Kürze verfügbar"
const adresseMord = "https://www.schwaebische-waldbahn.de/sonderfahrten/mord-im-schlemmerexpress"
const adresseNorm = "https://www.schwaebische-waldbahn.de/sonderfahrten/der-schlemmerexpress"

async function fetchMordImSchlemmerExpress() {
    let position;
    let foundText = false;
    let change = false;
    await axios.get(adresseMord, { responseType: 'document' }).then(function (response) {
        let text = response.data;
        position = text.search(searchText);
        const dom = new JSDOM(response.data)
        let strongs = dom.window.document.querySelectorAll("strong");
        strongs.forEach((strong) => {
            if (strong.innerHTML == searchText) {
                foundText = true;
            }
        });

        if (position != 100390 || foundText == false) {
            console.log("ALERT Mord im Express");
            sendMail("marvin@raithweg15.de")
            sendMail("michihofmann73@web.de")
            change = true
        }
        console.log("Schlemmerexpress (Mord) > pos: " + position + " Gefunden: " + foundText + " Änderung: " + change);

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

        if (position != 100248 || foundText == false) {
            console.log("ALERT normaler Express");
            sendMail("marvin@raithweg15.de")
            sendMail("michihofmann73@web.de")
            change = true
        }
        console.log("Schlemmerexpress (Norm) > pos: " + position + " Gefunden: " + foundText + " Änderung: " + change);

    })
        .catch(function (error) {
            console.log("Erroro fetching" + error);
        });
    return { type: "Normal" , position: position, foundText: foundText, change: change }
}


app.get("/checkPages", async function (req, res) {
    let res0 = await fetchMordImSchlemmerExpress()
    let res1 = await fetchImSchlemmerExpress()
    res.status(200).send({res0, res1})
});


/*********************** CRON ******************************** */
const CronJob = require('cron').CronJob;
//Begonnen am 1.4.2022 4:30
const job = new CronJob('*/1 * * * *', function () {
    console.log('JOB DONE');
    fetchImSchlemmerExpress()
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
    const htmlToSend = '<strong>Änderungen erkannt<strong>\n<a href="https://www.schwaebische-waldbahn.de/sonderfahrten/mord-im-schlemmerexpress">Mord Express</a>\n<a href="https://www.schwaebische-waldbahn.de/sonderfahrten/der-schlemmerexpress">Normal</a>'
    transporter.sendMail({
        from: '"Schlemmer Express checker" <aramrule.checker@gmx.de>',
        to: mail,
        subject: "❌ Änderung erkannt - Schlemmerexpress ❌",
        html: htmlToSend,
    });
}