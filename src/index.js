// Environment vars
const ENV = require('./environment/environment');

// Libraries
const mailgun = require('mailgun-js')({ apiKey: ENV.EMAIL.API_KEY, domain: ENV.EMAIL.DOMAIN });

// In-app
const UVSource = require('./sources/uv-index/uv-index');
const EmailBuilder = require('./email-creator/email-creator');

UVSource.harvest()
    .then(data => UVSource.generateHTML(data))
    .then(cardContent => EmailBuilder.buildEmail([cardContent]))
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