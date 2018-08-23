const AWS = require('aws-sdk');
const fs = require('fs');

const ENV = require('../environment/environment');

AWS.config.update({ accessKeyId: ENV.AWS.ACCESS_KEY_ID, secretAccessKey: ENV.AWS.SECRET_ACCESS_KEY });

module.exports = (indexHTMLPath = './index.html') => {
    return new Promise((resolve, reject) => {
        const s3 = new AWS.S3();
        const bucketName = 'www.provoreport.com';
        const fname = 'index.html';
        const buffer = fs.readFileSync(indexHTMLPath);

        s3.putObject({
            Bucket: bucketName,
            Key: fname,
            Body: buffer,
            ACL: 'public-read'
        }, function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}