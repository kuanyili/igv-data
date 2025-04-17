/**
 * This script reads a TSV file containing URLs and tests the existence with a HEAD request.
 * It logs the status code of each URL to the console.
 * The purpose is to validate the URLs in the TSV file, i.e find broken links.
 */

import fs from 'fs'
import readline from 'readline'

const filePath = '../data/url_mappings.tsv'

async function processFile(filePath) {
    const fileStream = fs.createReadStream(filePath)

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    })

    for await (const line of rl) {
        if (line.startsWith('#') || line.trim().length === 0) continue // Skip comments and empty lines
        const columns = line.split('\t') // Split the line by tab
        //for (const url of columns) {
        const url = columns[1]
            try {
                const response = await fetch(url, {method: 'HEAD', userAgent: 'IGV'})
                console.log(`URL: ${url}, Status: ${response.status}`)
            } catch (error) {
                console.error(`Error fetching URL: ${url}, Error: ${error.message}`)
            }
       // }
    }
}

processFile(filePath).catch((err) => {
    console.error('Error reading file:', err)
})