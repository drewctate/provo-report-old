// Libraries
const HandleBars = require('handlebars');
const fs = require('fs');
const { By } = require('selenium-webdriver');

/**
 * DAY
 */

const DAY_LOCATORS = {
    EVENT_LISTINGS: By.xpath('//*[@id="main-content-section"]/section[2]/div/div[1]/div'),
    EVENT_TITLE_LINK: By.xpath('strong/span/a'),
    EVENT_TIME: By.xpath('span[1]'),
    EVENT_LOCATION: By.xpath('div[3]'),
    EVENT_THUMBNAIL: By.xpath('div[1]/span/img')
}

const DAY_URL = 'https://calendar.byu.edu/';

/**
 * Harvests the events for today
 * @param {webdriver} driver 
 */
async function harvestDay(driver) {
    let events = [];
    await driver.get(DAY_URL);
    await driver.sleep(2000);
    const eventListingEls = await driver.findElements(DAY_LOCATORS.EVENT_LISTINGS);
    for (let el of eventListingEls) {
        let event = {};
        titleLinkEl = await el.findElement(DAY_LOCATORS.EVENT_TITLE_LINK);
        event.title = await titleLinkEl.getText();
        event.url = await titleLinkEl.getAttribute('href');
        event.time = await el.findElement(DAY_LOCATORS.EVENT_TIME).getText();
        event.location = await el.findElement(DAY_LOCATORS.EVENT_LOCATION).getText();
        event.thumbnail = await el.findElement(DAY_LOCATORS.EVENT_THUMBNAIL).getAttribute('src');
        events.push(event);
    }
    return events;
}

/**
 * WEEK
 */

const WEEK_LOCATORS = {
    DAY_LISTINGS: By.xpath('//*[@id="main-content-section"]/section[2]/div/div[2]/div/div/table/tbody/tr[2]/td'),
    FULL_DATE: By.xpath('div[2]/div/div[2]'),
    EVENT_LISTINGS: By.xpath('div/div/div/div/div/div'),
    EVENT_TITLE: By.xpath(`.//div[contains(@class,'views-field-title')]//a`),
    EVENT_THUMBNAIL: By.xpath('.//img'),
    EVENT_TIME: By.xpath(`.//span[contains(@class,'views-field-field-event-date')]`),
}

const WEEK_URL = 'https://calendar.byu.edu/calendar/week/2018-W34?field_tags_tid=All';

/**
 * Harvests the events for the week
 * @param {webdriver} driver 
 */
async function harvestWeek(driver) {
    let events = [];
    await driver.get(WEEK_URL);
    await driver.sleep(2000);

    // Page contains section for each day
    const dayListingEls = await driver.findElements(WEEK_LOCATORS.DAY_LISTINGS);
    for (let day of dayListingEls) {
        const dateText = await day.findElement(WEEK_LOCATORS.FULL_DATE).getText();
        let date;
        try {
            date = new Date(dateText);
        }
        catch (err) {
            console.error(`byu-events-calendar:harvestWeek - ${err}`);
            date = dateText;
        }

        // And individual event listings within each day section
        let eventEls = await day.findElements(WEEK_LOCATORS.EVENT_LISTINGS);
        for (let el of eventEls) {
            let text = await el.getText();
            if (!text) { // Skip empty listing
                continue;
            }

            let event = {};
            try {
                event.date = date;
                const titleLink = await el.findElement(WEEK_LOCATORS.EVENT_TITLE);
                event.title = await titleLink.getText();
                event.url = await titleLink.getAttribute('href');
                event.thumbnail = await el.findElement(WEEK_LOCATORS.EVENT_THUMBNAIL).getAttribute('src');
                event.time = await el.findElement(WEEK_LOCATORS.EVENT_TIME).getText();
                events.push(event);
            }
            catch (err) {
                console.error(err);
            }
        }
    }
    return events;
}

async function harvest(driver, timeSpan = 'day') {
    let events = []
    try {
        if (timeSpan === 'day') {
            events = await harvestDay(driver);
        } else {
            events = await harvestWeek(driver);
        }
    }
    catch (err) {
        console.error(err);
    }
    finally {
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
