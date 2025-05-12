import fs from 'fs'

const filePath = '/Users/jrobinso/igv-team Dropbox/James Robinson/projects/igv-data/hubs/bosTau9/trackDb.txt'

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err)
        return
    }

    const tracks = new Set()
    const lines = data.split('\n') // Split file contents into lines
    for (let line of lines) {
        line = line.trim()
        const [firstPart, secondPart] = line.split(' ', 2) // Split line into two parts at the first whitespace
        if (firstPart === 'track') {
            if (tracks.has(secondPart)) {
                console.log(`Duplicate track found: ${secondPart}`)
            } else {
                tracks.add(secondPart)
            }
        }
    }
})
