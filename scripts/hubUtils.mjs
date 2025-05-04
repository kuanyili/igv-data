/**
 * Convert hub URLs in a UCSC hub text file to absolute URLs
 */


import fs from 'fs'
import {mergeTrackDB} from "./mergeHubs.mjs"


(async function () {

    const pairs = [
        "../hubs/canFam4/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCF/011/100/685/GCF_011100685.1/hub.txt",
        "../hubs/canFam6/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/002/285/GCF_000002285.5/hub.txt",
        "../hubs/dm6/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/215/GCF_000001215.4/hub.txt",
        "../hubs/galGal6/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/002/315/GCF_000002315.6/hub.txt",
        "../hubs/gorGor6/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCF/008/122/165/GCF_008122165.1/hub.txt",
        "../hubs/hg38/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/405/GCF_000001405.40/hub.txt",
        "../hubs/hs1/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/gbdb/hs1/hubs/public/hub.txt",
        "../hubs/macFas5/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCA/000/364/345/GCA_000364345.1/hub.txt",
        "../hubs/mm10/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/635/GCF_000001635.26/hub.txt",
        "../hubs/mm39/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/001/635/GCF_000001635.27/hub.txt",
        "../hubs/panTro6/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCA/002/880/755/GCA_002880755.3/hub.txt",
        "../hubs/rn7/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCF/015/227/675/GCF_015227675.2/hub.txt",
        "../hubs/sacCer3/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/146/045/GCF_000146045.2/hub.txt",
        "../hubs/susScr11/trackDb.txt",
        "https://hgdownload.soe.ucsc.edu/hubs/GCF/000/003/025/GCF_000003025.6/hub.txt"
    ]


    for (let i = 0; i < pairs.length; i += 2) {
        const first = pairs[i]
        const second = pairs[i + 1]

        const absFile = `tmp${i}.txt`
        console.log(`Converting ${first} to absolute URLs ${absFile}`)
        await toAbsolute(second, absFile)

        const outputFile = first
        console.log(`Merging ${first} and ${absFile} into ${outputFile}`)
        await mergeTrackDB(first, absFile, outputFile)

        //fs.unlinkSync(absFile)
    }
})()


async function toAbsolute(hubURL, outputFile) {

    const idx = hubURL.lastIndexOf("/")
    const baseURL = hubURL.substring(0, idx + 1)

    const urlProperties = new Set(["descriptionUrl", "desriptionUrl",
        "twoBitPath", "blat", "chromAliasBb", "twoBitBptURL", "twoBitBptUrl", "htmlPath", "bigDataUrl",
        "genomesFile", "trackDb", "groups", "include", "html", "searchTrix", "linkDataUrl", "chromSizes"])

    // Fetch hub text
    const response = await fetch(hubURL)
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    const text = await response.text()

    const lines = text.split('\n')

    const out = fs.createWriteStream(outputFile, {flags: 'w'})

    for (let line of lines) {

        const indent = indentLevel(line)
        const i = line.indexOf(' ', indent)
        if (i < 0 || line.trim().startsWith('#')) {
            out.write(line)
            out.write('\n')
            continue
        }

        const key = line.substring(indent, i).trim()
        if (urlProperties.has(key)) {
            const value = line.substring(i + 1).trim()
            out.write(' '.repeat(indent))
            out.write(`${key} ${baseURL}${value}`)
        } else {
            out.write(line)
        }
        out.write('\n')
    }
    out.end()

}

function firstWord(str) {
    const idx = str.indexOf(' ')
    return idx > 0 ? str.substring(0, idx) : str
}

function indentLevel(str) {
    let level = 0
    for (level = 0; level < str.length; level++) {
        const c = str.charAt(level)
        if (c !== ' ' && c !== '\t') break
    }
    return level
}