import fs from 'fs'
import path from 'path'

processGenome('hg38')

async function processGenome(genomeId) {

    const ws = 'https://api.genome.ucsc.edu/list/tracks'

    const host = "https://hgdownload.soe.ucsc.edu"

    const supportedTypes = new Set(["bigbed", "bigwig", "biggenepred", "vcftabix", "refgene",
        "bam", "sampleinfo", "vcf.list", "ucscsnp", "bed", "tdf", "gff", "gff3", "gtf", "vcf"])

    const urlProperties = new Set(["descriptionUrl", "desriptionUrl",
        "twoBitPath", "blat", "chromAliasBb", "twoBitBptURL", "twoBitBptUrl", "htmlPath", "bigDataUrl",
        "genomesFile", "trackDb", "groups", "include", "html", "searchTrix"])

    const knownGroupings = new Map([
        ["tabulaMuris", "genes"],
        ["fantom5", "regulation"],
        ["transMapV5", "genes"],
        ["encode3Reg", "regulation"],
        ["wgEncodeReg", "regulation"],
        ["spliceImpactSuper", "phenDis"],
        ["bloodHao", "singleCell"],
        ["caddSuper1_7", "phenDis"],
        ["caddSuper", "phenDis"],
        ["covid", "phenDis"],
        ["cancerExpr", "phenDis"],
        ["tabulaSapiens", "singleCell"],
        ["skinSoleBoldo", "singleCell"],
        ["rectumWang", "singleCell"],
        ["recombRate2", "map"],
        ["placentaVentoTormo", "singleCell"]
    ])


    // Define output directory.  This will be created if it does not exist
    const outputDir = path.join(import.meta.dirname, '..', 'hubs', genomeId, 'trackDBs')
    if (!fs.existsSync(outputDir)) {
        // If it doesn't exist, create the directory
        fs.mkdirSync(outputDir)
    }

    // Fetch track json
    const url = `${ws}?genome=${genomeId}`
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    const json = await response.json()


    // Build trees and container map
    const root = json[genomeId]
    const topLevelNodes = []
    const containerMap = new Map()
    for (let entry of Object.entries(root)) {
        processNode(entry)
    }

    const filteredNodes = topLevelNodes.filter(n => n.hasDataUrl())

    const groupMap = new Map()
    for (let track of filteredNodes) {
        const groupName = track.findGroup() || "unknown"
        if (!groupMap.has(groupName)) {
            groupMap.set(groupName, [])
        }
        groupMap.get(groupName).push(track)
    }

    const outCombined = fs.createWriteStream(path.join(`${outputDir}`, `${genomeId}_trackDb.txt`), {flags: 'w'})
    for (let [name, group] of groupMap.entries()) {
        const out = fs.createWriteStream(path.join(`${outputDir}`, `${name}_trackDb.txt`), {flags: 'w'})
        for (let node of group) {
            outputTrack(node, out, outCombined, 0)
        }
        out.end()
    }


    function processNode([name, stanza]) {

        //if (!filterTrack(stanza)) {
        //    return
        //}

        const track = new Track(name, stanza)

        if (isContainer(stanza)) {
            containerMap.set(name, track)
        }

        if (stanza.hasOwnProperty('parent')) {
            const parentName = firstWord(stanza.parent)
            let p = containerMap.get(parentName)
            if (!p) {
                p = new Track(parentName, {
                    track: parentName,
                    shortLabel: parentName.toUpperCase()
                })
                if (stanza.hasOwnProperty('group')) {
                    p.group = stanza.group
                }
                topLevelNodes.push(p)
                containerMap.set(parentName, p)
            }
            p.children.push(track)
        } else {
            topLevelNodes.push(track)
        }

        for (let keyValue of Object.entries(stanza)) {
            if (typeof keyValue[1] !== 'string') {
                processNode(keyValue)
            }
        }

    }

    function outputTrack(track, out, outCombined, indentLevel) {

        // 'a' flag stands for 'append'

        out.write('\n')
        out.write(' '.repeat(indentLevel * 4))
        out.write(`track ${track.name}\n`)
        outCombined.write('\n')
        outCombined.write(' '.repeat(indentLevel * 4))
        outCombined.write(`track ${track.name}\n`)
        for (let keyValue of Object.entries(track.stanza)) {

            let [key, value] = keyValue
            if (typeof value === 'string') {
                if (key === 'bigDataUrl' || key === 'bigDataIndex') {
                    value = host + value
                } else if (urlProperties.has(key) && !value.startsWith("http")) {
                    continue   // We don't know how to interpret relative URLs other than the data url
                }
                if (key === 'superTrack' && track.hasOwnProperty('bigDataUrl')) {
                    continue  // We don't know how to handle a container with its own data.  Treat as a track
                }
                out.write(' '.repeat(indentLevel * 4))
                out.write(`${key} ${value}\n`)
                outCombined.write(' '.repeat(indentLevel * 4))
                outCombined.write(`${key} ${value}\n`)
            }
        }
        for (let child of track.children) {
            outputTrack(child, out, outCombined, indentLevel + 1)
        }

    }
}

function getDataUrl(url, host) {
    return url.startsWith("http://") || url.startsWith("https://") ? url :
        url.startsWith("/") ? host + url : host + "/" + url
}

function isContainer(s) {
    return s.compositeContainer || s.compositeViewContainer ||
        s.hasOwnProperty("superTrack") || s.hasOwnProperty("compositeTrack") || s.hasOwnProperty("view")
        || (s.hasOwnProperty("container") && s["container"] === "multiWig")
}


function filterTrack(stanza) {
    return isContainer(stanza) || (stanza['type'] && supportedTypes.has(stanza['type'].toLowerCase()))
}

function firstWord(str) {
    const idx = str.indexOf(' ')
    return idx > 0 ? str.substring(0, idx) : str
}

class Track {

    children = []

    constructor(name, stanza) {
        this.name = name
        this.stanza = stanza
    }

    hasDataUrl() {
        if (this.stanza.hasOwnProperty('bigDataUrl')) {
            return true
        } else {
            for (let c of this.children) {
                if (c.hasDataUrl()) {
                    return true
                }
            }
            return false
        }
    }

    findGroup() {
        if(this.stanza.hasOwnProperty('group')) {
            return this.stanza['group']
        } else {
            for(let c of this.children) {
                const p = c.findGroup()
                if(p) {
                    return p
                }
            }
        }
    }
}