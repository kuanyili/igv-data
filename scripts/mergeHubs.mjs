/**
 * Convert hub URLs in a UCSC hub text file to absolute URLs
 */


import fs from 'fs'


async function mergeTrackDB(first, second, outputFile) {

    const tracks = new Set()

    const out = fs.createWriteStream(outputFile, {flags: 'w'})

    const files = [first, second]

    let skipStanza = false
    for (const file of files) {
        const data = fs.readFileSync(file, 'utf8')
        const lines = data.split('\n')
        for (const line of lines) {
            if (line.trim().length === 0) {
                out.write('\n')
                skipStanza = false
                continue
            }
            const key = firstWord(line.trim())
            if(key === 'hub' || key === 'genome' ) {
                skipStanza = true
            }
            if(skipStanza) {
                continue
            }
            if (key === 'track') {
                const idx = line.indexOf(' ')
                const value = line.substring(idx + 1).trim()
                if (tracks.has(value.toLowerCase())) {
                    console.log(`Duplicate track found: ${value}`)
                    skipStanza = true
                } else {
                    out.write(line + '\n')
                    tracks.add(value.toLowerCase())
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

export {mergeTrackDB}