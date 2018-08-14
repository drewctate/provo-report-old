// Libraries
const HandleBars = require('handlebars');
const fs = require('fs');
const { By } = require('selenium-webdriver');
const Jimp = require('jimp');

// In App
const upload2S3 = require('../../utils/upload2S3');

const sourceUrl = 'https://www.ksl.com/?nid=88&city=Provo';

const LOCATORS = {
    HOURLY_LINK: By.xpath('/html/body/div/div[2]/div[3]/div/div[7]/div/div/div[3]/div[1]/div[2]'),
    HOURLY_DIV: By.xpath('/html/body/div/div[2]/div[3]/div/div[7]/div/div/div[3]/div[4]'),
    WEATHER_PANEL: By.xpath('/html/body/div/div[2]/div[3]/div/div[7]/div/div/div[3]')
};

async function harvest(driver) {
    try {
        await driver.get(sourceUrl);
        await driver.sleep(2000);
        await driver.findElement(LOCATORS.HOURLY_LINK).click();
        const b64 = await driver.takeScreenshot();
        const buf = new Buffer(b64.replace(/^data:image\/\w+;base64,/, ""), 'base64');

        // TODO wish these could be computed automatically
        const cropParams = [900, 474, 1310, 578];
        const croppedBuf = await Jimp.read(buf)
            .then(image => {
                return image
                    .crop(...cropParams)
                    .getBufferAsync(Jimp.MIME_PNG);
            })
            .catch(err => {
                console.error(`weather:harvest (Jimp) - ${err}`);
            });

        resourceUrl = await upload2S3('weather.png', croppedBuf);
        return { imgSrc: resourceUrl, sourceUrl: sourceUrl };
    } catch (err) {
        console.error(`weather:harvest - ${err}`);
        return null;
    }
}

function generateHTML(args) {
    const data = fs.readFileSync(__dirname + '/weather.hbs');
    const sourceHTML = data.toString();
    const template = HandleBars.compile(sourceHTML);
    return template(args);
}

module.exports.harvest = harvest;
module.exports.generateHTML = generateHTML;
