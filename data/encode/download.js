const https = require('https')
const fs = require('fs')
const path = require('path')

function downloadFile(url, savePath) {
    const file = fs.createWriteStream(savePath)

    console.log(`Starting download from: ${url}`)

    https.get(url, {headers: {'User-Agent': 'IGV'}}, (response) => {
        if (response.statusCode !== 200) {
            console.error(`Failed to download file. HTTP Status: ${response.statusCode}`)
            response.resume() // Consume response data to free up memory
            return
        }
        response.pipe(file)

        file.on('finish', () => {
            file.close(() => {
                console.log(`File downloaded and saved to: ${savePath}`)
            })
        })
    }).on('error', (err) => {
        fs.unlink(savePath, () => {
        }) // Delete the file if an error occurs
        console.error(`Error downloading file: ${err.message}`)
    })

    file.on('error', (err) => {
        fs.unlink(savePath, () => {
        }) // Delete the file if an error occurs
        console.error(`Error saving file: ${err.message}`)
    })
}

async function downloadAll() {
    const genomes = ["GRCh38", "hg19", "mm9", "mm10", "ce11", "ce10"] // Add more genome names as needed
    const types = ["signals.chip", "signals.other", "other"] // Add more types as needed

    for (let genome of genomes) {
        for (let type of types) {
            const filename = `${genome}.${type}.txt`
            const url = `https://s3.amazonaws.com/igv.org.app/encode/${filename}` // Replace with actual URL
            const savePath = path.join(__dirname, filename)
            await downloadFile(url, savePath)
        }
    }
}


downloadAll()