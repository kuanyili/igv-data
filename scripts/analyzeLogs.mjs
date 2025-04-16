import fs from 'fs'
import path from 'path'
import readline from 'readline'

const directoryPath = process.argv[2] // Replace with your directory path

const countByFile = new Map()
const countByUserAgent = new Map()
let countPython = 0
let countGalaxy = 0
let other403 = 0
let legit = 0
const galaxyFiles = new Set()
const pythonFiles = new Set()

async function processFilesInDirectory(directory) {

    const files = fs.readdirSync(directory)

    for (const file of files) {
        const filePath = path.join(directory, file)

        if (fs.statSync(filePath).isFile()) {

            const fileStream = fs.createReadStream(filePath)
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            })

            for await (const line of rl) {
                const splitLine = line.split(/\s+/) // Split by whitespace

                let file = splitLine[10]
                const idx = file.indexOf("?")
                if (idx > 0) {
                    file = file.substring(0, idx)
                }

                const userAgent = splitLine[19]

                if (!countByFile.has(file)) {
                    countByFile.set(file, 0)
                }
                countByFile.set(file, countByFile.get(file) + 1)
                if (!countByUserAgent.has(userAgent)) {
                    countByUserAgent.set(userAgent, 0)
                }
                countByUserAgent.set(userAgent, countByUserAgent.get(userAgent) + 1)

                if (userAgent.includes("python")) {
                    pythonFiles.add(file)
                    countPython++
                } else if (userAgent.includes("galaxy")) {
                    galaxyFiles.add(file)
                    countGalaxy++
                } else if (splitLine[12] === "403") {
                    other403++
                } else {
                    legit++
                }
            }
        }
    }

    console.log("Python requests:", countPython)
    console.log("Galaxy requests:", countGalaxy)
    console.log("Other 403 errors:", other403)
    console.log("Legitimate requests:", legit)
    console.log("Python files: " + Array.from(pythonFiles)[0])
    console.log("Galaxy files: " + Array.from(galaxyFiles)[0])
    for(let entry of countByFile.entries()) {
        console.log(entry[0], entry[1])
    }
    for(let entry of countByUserAgent.entries()) {
            console.log(entry[0], entry[1])
    }



}

processFilesInDirectory(directoryPath).catch((err) => {
    console.error('Error processing files:', err)
})