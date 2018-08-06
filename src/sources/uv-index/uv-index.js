const axios = require('axios');
const ChartjsNode = require('chartjs-node');
const HandleBars = require('handlebars');
const upload2S3 = require('../../utils/upload2S3');
const fs = require('fs');

const UV_IDX_URL = 'https://iaspub.epa.gov/enviro/efservice/getEnvirofactsUVHOURLY/ZIP/84604/json';

module.exports.harvest = _ =>
    axios.get(UV_IDX_URL)
        .then(resp => resp.data)
        .then(data => makeBarChartImage(data))
        .then(imgStream => upload2S3('uv-index.png', imgStream))
        .then(resourceUrl => {
            return { imgSrc: resourceUrl };
        });

module.exports.generateHTML = (args) => {
    const data = fs.readFileSync(__dirname + '/uv-index.hbs');
    const sourceHTML = data.toString();
    const template = HandleBars.compile(sourceHTML);
    return template({ imgSrc: args.imgSrc });
}

/**
 * Returns full configuration for bar chart in ChartJS
 * @param {array} data The array of data returned from the EPA
 */
function getUvChartOptions(data) {
    const labels = data.reduce((arr, cur) => {
        arr.push(cur.DATE_TIME.substring(12));
        return arr;
    }, [])

    const idxs = data.reduce((arr, cur) => {
        arr.push(cur.UV_VALUE);
        return arr;
    }, [])

    return {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Hourly UV Index',
                data: idxs,
                backgroundColor: 'rgba(255, 206, 86, .5)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    }
}


/**
 * Makes a bar chart image of the UV Index values
 * @param {array} data The array of data returned from the EPA
 * @return Image buffer (png)
 */
function makeBarChartImage(data) {
    const chartNode = new ChartjsNode(600, 400);
    const chartOptions = getUvChartOptions(data);
    // TODO return image data
    return chartNode.drawChart(chartOptions)
        .then(_ => {
            // write to a file
            return chartNode.getImageBuffer('image/png');
        });
}