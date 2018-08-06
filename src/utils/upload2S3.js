const AWS = require('aws-sdk');
const ENV = require('../environment/environment');

// For dev purposes only
AWS.config.update({ accessKeyId: ENV.AWS.ACCESS_KEY_ID, secretAccessKey: ENV.AWS.SECRET_ACCESS_KEY });

/**
 * Contructs the resource URL for a given file in a given bucket.
 * @param {string} bucketName The name of the bucket
 * @param {string} key The path to the resource
 */
function getResourceURL(bucketName, key) {
    return `http://${bucketName}.s3.amazonaws.com/${key}`;
}

module.exports = (fname, buffer) => {
    return new Promise((resolve, reject) => {
        const s3 = new AWS.S3();
        const bucketName = 'provoreport';

        s3.putObject({
            Bucket: bucketName,
            Key: fname,
            Body: buffer,
            ACL: 'public-read'
        }, function (err, data) {
            if (err) {
                reject(err);
            }
            const url = getResourceURL(bucketName, fname);
            resolve(url);
        });
    });
}