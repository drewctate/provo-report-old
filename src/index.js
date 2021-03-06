// Environment vars
const ENV = require('./environment/environment');

// Libraries
const mailgun = require('mailgun-js')({ apiKey: ENV.EMAIL.API_KEY, domain: ENV.EMAIL.DOMAIN });
const fs = require('fs');
const { Builder } = require('selenium-webdriver');
const readline = require('readline');

// In-app
const WeatherSource = require('./sources/weather/weather');
const UVGraphicSource = require('./sources/uv-index-graphic/uv-index-graphic');
const BYUEventsCalendarSource = require('./sources/byu-events-calendar/byu-events-calendar');
const UtahValleyEventsSource = require('./sources/utah-valley-events/utah-valley-events');
const EmailBuilder = require('./email-creator/email-creator');

// Utils
const deployWebsite = require('./utils/deploy');


(async function main() {
    let webdriver;
    try {
        webdriver = await new Builder().forBrowser('chrome').build();

        const goodSources = await getGoodSources(webdriver);

        const emailContent = await EmailBuilder.buildEmail(goodSources);
        fs.writeFileSync('index.html', emailContent);

        let deployRes = await deployWebsite();

        console.log(`Website deployed! ${JSON.stringify(deployRes)}`);


        if (process.argv.length > 2 && process.argv[2] !== '--no-email') {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('Send email? [Y/n] ', (answer) => {
                if (answer.trim() === 'n') {
                    console.log('Email cancelled');
                }
                else {
                    sendEmail(emailContent);
                }

                rl.close();
            });
        }
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await webdriver.quit();
    }
})();

/**
 * Sends the email
 * @param {html} emailContent
 */
function sendEmail(emailContent) {
    const data = {
        from: 'Provo Report <info@provoreport.com>',
        to: 'Andrew Tate <drewctate@gmail.com>, Natalie Dickman <thenatterbug@gmail.com>, Spencer Cook <spencercook@gmail.com>',
        subject: 'Provo Report',
        html: emailContent
    };

    return new Promise((resolve, reject) => {
        mailgun.messages().send(data, function (err, body) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log('Email successful!');
                resolve(body)
            }
        });
    })
}

/**
 * Gets the HTML for the sources that don't return null from their generateHTML functions
 * @param {*} webdriver 
 */
async function getGoodSources(webdriver) {
    const byuEventsHTML = BYUEventsCalendarSource.generateHTML(
        await BYUEventsCalendarSource.harvest(webdriver)
    );

    const utahValleyEventsHTML = UtahValleyEventsSource.generateHTML(
        await UtahValleyEventsSource.harvest(webdriver)
    );

    const uvGraphicHTML = UVGraphicSource.generateHTML(await UVGraphicSource.harvest(webdriver));

    const weatherHTML = WeatherSource.generateHTML(await WeatherSource.harvest(webdriver));

    const goodSources = [weatherHTML, uvGraphicHTML, byuEventsHTML, utahValleyEventsHTML].filter(val => {
        return val !== null;
    });

    return goodSources;
}