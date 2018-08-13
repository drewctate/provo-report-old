// Environment vars
const ENV = require('./environment/environment');

// Libraries
const mailgun = require('mailgun-js')({ apiKey: ENV.EMAIL.API_KEY, domain: ENV.EMAIL.DOMAIN });
const { Builder } = require('selenium-webdriver');

// In-app
const UVSource = require('./sources/uv-index/uv-index');
const BYUEventsCalendarSource = require('./sources/byu-events-calendar/byu-events-calendar');
const EmailBuilder = require('./email-creator/email-creator');

(async function main() {
    let webdriver;
    try {
        webdriver = await new Builder().forBrowser('chrome').build();
        const byuEventsHTML = BYUEventsCalendarSource.generateHTML(
            await BYUEventsCalendarSource.harvest(webdriver));
        const uvHTML = UVSource.generateHTML(await UVSource.harvest());

        const goodSources = [byuEventsHTML, uvHTML].filter(val => {
            return val !== null;
        });

        const emailContent = await EmailBuilder.buildEmail(goodSources);

        const data = {
            from: 'Provo Report <info@provoreport.com>',
            to: 'drewctate@gmail.com',
            subject: 'Provo Report',
            html: emailContent
        };

        mailgun.messages().send(data, function (err, body) {
            if (err) {
                console.error(err);
            } else {
                console.log(body);
            }
        });
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await webdriver.quit();
    }
})(); 