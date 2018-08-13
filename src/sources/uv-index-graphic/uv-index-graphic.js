// Libraries
const HandleBars = require('handlebars');
const fs = require('fs');
const { By } = require('selenium-webdriver');

const LOCATORS = {
    GRAPHIC: By.xpath('//*[@id="main-content"]/div[2]/div/div/div[2]/div/div/div/table/tbody/tr/td/center[1]/a/img')
}

async function harvest(driver) {
    const sourceUrl = 'https://ofmpub.epa.gov/enviro/uv_search_v2?minx=-111.88603639999998&miny=40.03237680000006&maxx=-111.43803639999997&maxy=40.48037680000005';
    try {
        await driver.get(sourceUrl);
        let imgSrc = await driver.findElement(LOCATORS.GRAPHIC).getAttribute('src');
        return {
            imgSrc: imgSrc,
            sourceUrl: sourceUrl
        }
    }
    catch (err) {
        console.error(`uv-index-graphic:harvest - ${err}`)
        return null;
    }
}

function generateHTML(args) {
    const data = fs.readFileSync(__dirname + '/uv-index-graphic.hbs');
    const sourceHTML = data.toString();
    const template = HandleBars.compile(sourceHTML);
    return template(args);
}

module.exports.harvest = harvest;
module.exports.generateHTML = generateHTML;
