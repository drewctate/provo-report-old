const fs = require('fs');
const HandleBars = require('handlebars');
const inlineCss = require('inline-css');

/**
 * Builds the finished email
 * @param {string[]} cardContents The HTML contents of the cards in array form
 */
function buildEmail(cardContents) {
    const data = fs.readFileSync(__dirname + '/main.hbs');
    const sourceHTML = data.toString();
    const template = HandleBars.compile(sourceHTML);
    const today = new Date();
    const renderedHTML = template({
        cards: cardContents,
        date: `${today.getMonth()}/${today.getDate()}/${today.getFullYear()}`
    });
    return inlineCss(renderedHTML, { url: `file://${__dirname}/email-creator` });
}

module.exports.buildEmail = buildEmail;