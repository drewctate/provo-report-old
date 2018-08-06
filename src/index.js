// Environment vars
const ENV = require('./environment/environment');

// Libraries
const mailgun = require('mailgun-js')({ apiKey: ENV.EMAIL.API_KEY, domain: ENV.EMAIL.DOMAIN });

// In-app
const UVSource = require('./sources/uv-index/uv-index');

UVSource.harvest()
    .then(data => {
        const html = UVSource.generateHTML(data);
        return `
            <h1>Provo Report</h1>
            <br>
            ${html}     
        `
    })
    .then(emailContent => {
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
    })
    .catch(console.error);