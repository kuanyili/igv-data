/**
 * Concatenate json files for use with igv.js and igv-webapp.  Also does some json conversions to work around
 * differences in igv.js and IGV
 */


const fs = require('fs')
const genomesListFile = require.resolve("./genomes_list.txt")
const genomesList = fs.readFileSync(genomesListFile, 'utf-8')
const lines = genomesList.split(/\r?\n/)

const jsonArray = []
for (let line of lines) {
    try {
        line = line.trim()
        if (line.length > 0) {
            const jsonFile = require.resolve("../json/" + line)
            const json = JSON.parse(fs.readFileSync(jsonFile))

            // Remove "hidden" tracks -- not supported by igv.js
            if (json.tracks) {
                const newTracks = []
                for (let t of json.tracks) {
                    //if (!t.hidden) {
                       newTracks.push(t)
                    //}
                    if (t.color) {
                        t.color = fixColorString(t.color)
                    }
                    if (t.altColor) {
                        t.altColor = fixColorString(t.altColor)
                    }
                }
                json.tracks = newTracks
            }

            // Convert chromosome order to string -- neccessary for older versions of igv.js
            if(json.chromosomeOrder && Array.isArray(json.chromosomeOrder)) {
                json.chromosomeOrder = json.chromosomeOrder.join()
            }

            jsonArray.push(json)
        }
    } catch (e) {
        console.error("Error fetching json for: " + line)
    }
}

function fixColorString(str) {
    if (str.includes(",") && !str.startsWith("rgb")) {
        return `rgb(${str})`
    } else {
        return str
    }
}

const jsonText = JSON.stringify(jsonArray) //, null, 2);
const outputFile = require('path').join(__dirname, "./genomes.json");
const fd = fs.openSync(outputFile, "w")
fs.writeSync(fd, jsonText)
fs.closeSync(fd)




