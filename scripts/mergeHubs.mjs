/**
 * Convert hub URLs in a UCSC hub text file to absolute URLs
 */


import fs from 'fs'

(async function () {
    await mergeTrackDB(
        '/Users/jrobinso/igv-team Dropbox/James Robinson/projects/igv-genomes/hubs/bosTau9/trackDb.txt',
        'bosTau9.hub.txt',
        'merged.txt')
})()

async function mergeTrackDB(first, second, outputFile) {

    const tracks = new Set()

    const out = fs.createWriteStream(outputFile, {flags: 'w'})

    const files = [first, second]

    for (const file of files) {
        const data = fs.readFileSync(file, 'utf8')
        const lines = data.split('\n')
        for (const line of lines) {
            const key = firstWord(line.trim())
            if (key === 'track') {
                const idx = line.indexOf(' ')
                const value = line.substring(idx + 1).trim()
                if (tracks.has(value)) {
                    console.log(`Duplicate track found: ${value}`)
                } else {
                    out.write(line + '\n')
                    tracks.add(value)
                }
            } else {
                out.write(line + '\n')
            }
        }
    }

    out.end()

}


function firstWord(str) {
    const idx = str.indexOf(' ')
    return idx > 0 ? str.substring(0, idx) : str
}
