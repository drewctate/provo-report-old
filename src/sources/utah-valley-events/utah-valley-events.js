// Libraries
const HandleBars = require('handlebars');
const fs = require('fs');
const { By } = require('selenium-webdriver');

const LOCATORS = {
    TODAY_LINK: By.xpath('/html/body/div[1]/div/div[3]/div[3]/div/div/div/div[2]/div/div[2]/form/div[1]/div/ul/li[1]/a'),
    EVENT_LISTINGS: By.xpath('/html/body/div[1]/div/div[3]/div[3]/div/div/div/div[2]/div/div[4]/div[position()>1]'),
    EVENT_TITLE_LINK: By.xpath('div/div[2]/div/h4/a'),
    EVENT_LOCATION: By.xpath('div/div[2]/div/ul/li[2]'),
    EVENT_THUMBNAIL: By.xpath('div/div[1]/a/img')
}

async function harvest(driver) {
    let events = [];

    try {
        await driver.get('https://www.utahvalley.com/events/');
        let todayURL = await driver.findElement(LOCATORS.TODAY_LINK).getAttribute('href');
        await driver.get(todayURL);
        await driver.sleep(2000);
        const eventListingEls = await driver.findElements(LOCATORS.EVENT_LISTINGS);
        for (let el of eventListingEls) {
            let event = {}
            titleLinkEl = await el.findElement(LOCATORS.EVENT_TITLE_LINK);
            event.title = await titleLinkEl.getText();
            event.url = await titleLinkEl.getAttribute('href');
            // event.time = await el.findElement(LOCATORS.EVENT_TIME).getText();
            try {
                event.location = await el.findElement(LOCATORS.EVENT_LOCATION).getText();
            }
            catch (err) {
                console.info(`utah-valley-events:harvest - Unable to find venue location for "${event.title}"`);
                event.location = null;
            }
            event.thumbnail = await el.findElement(LOCATORS.EVENT_THUMBNAIL).getAttribute('src');
            events.push(event);
        }
    } finally {
        return events;
    }
}

function generateHTML(events) {
    const data = fs.readFileSync(__dirname + '/utah-valley-events.hbs');
    const sourceHTML = data.toString();
    const template = HandleBars.compile(sourceHTML);
    return template({ events: events });
}

module.exports.harvest = harvest;
module.exports.generateHTML = generateHTML;
