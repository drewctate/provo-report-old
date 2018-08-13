// Libraries
const HandleBars = require('handlebars');
const fs = require('fs');
const { By } = require('selenium-webdriver');

const LOCATORS = {
    EVENT_LISTINGS: By.xpath('//*[@id="main-content-section"]/section[2]/div/div[1]/div'),
    EVENT_TITLE_LINK: By.xpath('strong/span/a'),
    EVENT_TIME: By.xpath('span[1]'),
    EVENT_LOCATION: By.xpath('div[3]'),
    EVENT_THUMBNAIL: By.xpath('div[1]/span/img')
}

async function harvest(driver) {
    let events = [];

    try {
        await driver.get('https://calendar.byu.edu/');
        const eventListingEls = await driver.findElements(LOCATORS.EVENT_LISTINGS);
        for (let el of eventListingEls) {
            let event = {};
            titleLinkEl = await el.findElement(LOCATORS.EVENT_TITLE_LINK);
            event.title = await titleLinkEl.getText();
            event.url = await titleLinkEl.getAttribute('href');
            event.time = await el.findElement(LOCATORS.EVENT_TIME).getText();
            event.location = await el.findElement(LOCATORS.EVENT_LOCATION).getText();
            event.thumbnail = await el.findElement(LOCATORS.EVENT_THUMBNAIL).getAttribute('src');
            events.push(event);
        }
    } finally {
        return events;
    }
}

function generateHTML(events) {
    const data = fs.readFileSync(__dirname + '/byu-events-calendar.hbs');
    const sourceHTML = data.toString();
    const template = HandleBars.compile(sourceHTML);
    return template({ events: events });
}

module.exports.harvest = harvest;
module.exports.generateHTML = generateHTML;
