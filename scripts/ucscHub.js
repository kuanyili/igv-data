/*
 https://genomewiki.ucsc.edu/index.php/Assembly_Hubs
 https://genome.ucsc.edu/goldenpath/help/hgTrackHubHelp.html
 https://genome.ucsc.edu/goldenPath/help/hgTrackHubHelp
 https://genome.ucsc.edu/goldenpath/help/trackDb/trackDbHub.html
 */


class Hub {

    static supportedTypes = new Set(["bigBed", "bigWig", "bigGenePred", "vcfTabix"])
    static filterTracks = new Set(["cytoBandIdeo", "assembly", "gap", "gapOverlap", "allGaps",
        "cpgIslandExtUnmasked", "windowMasker"])

    static async loadHub(url) {

        const idx = url.lastIndexOf("/")
        const baseURL = url.substring(0, idx + 1)
        const stanzas = await loadStanzas(url)
        let groups
        if ("genome" === stanzas[1].type) {
            const genome = stanzas[1]
            if (genome.hasProperty("groups")) {
                const groupsTxtURL = baseURL + genome.getProperty("groups")
                groups = await loadStanzas(groupsTxtURL)
            }

            // If the genome has a chromSizes file, and it is not too large, set the chromSizesURL property.  This will
            // enable whole genome view and the chromosome pulldown
            if (genome.hasProperty("chromSizes")) {
                const chromSizesURL = baseURL + genome.getProperty("chromSizes")
                const l = await getContentLength(chromSizesURL)
                if (l !== null && Number.parseInt(l) < 1000000) {
                    genome.setProperty("chromSizesURL", chromSizesURL)
                }
            }
        }

        return new Hub(url, stanzas, groups)
    }

    constructor(url, stanzas, groupStanzas) {

        this.url = url

        const idx = url.lastIndexOf("/")
        this.baseURL = url.substring(0, idx + 1)

        // The first stanza must be type = hub
        if ("hub" === stanzas[0].type) {
            this.hubStanza = stanzas[0]
        } else {
            throw Error("Unexpected hub.txt file -- does the first line start with 'hub'?")
        }
        if ("on" !== this.hubStanza.getProperty("useOneFile")) {
            throw Error("Only 'useOneFile' hubs are currently supported")
        }
        if (stanzas.length < 2) {
            throw Error("Expected at least 2 stanzas, hub and genome")
        }

        // The second stanza should be a genome
        if ("genome" === stanzas[1].type) {
            this.genomeStanza = stanzas[1]
        } else {
            throw Error(`Unexpected hub file -- expected "genome" stanza but found "${stanzas[1].type}"`)
        }

        // Remaining stanzas should be tracks
        this.trackStanzas = []
        for (let i = 2; i < stanzas.length; i++) {
            if ("track" === stanzas[i].type) {
                this.trackStanzas.push(stanzas[i])
            }
        }

        if (groupStanzas) {
            this.groupStanzas = groupStanzas
            this.groupPriorityMap = new Map()
            for (let g of groupStanzas) {
                if (g.hasProperty("priority")) {
                    this.groupPriorityMap.set(g.getProperty("name"), Number.parseInt(g.getProperty("priority")) * 10)
                }
            }
        }
    }

}

function firstWord(str) {
    const idx = str.indexOf(' ')
    return idx > 0 ? str.substring(0, idx) : str
}

class Stanza {

    properties = new Map()

    constructor(type, name) {
        this.type = type
        this.name = name
    }

    setProperty(key, value) {
        this.properties.set(key, value)
    }

    getProperty(key) {
        if (this.properties.has(key)) {
            return this.properties.get(key)
        } else if (this.parent) {
            return this.parent.getProperty(key)
        } else {
            return undefined
        }
    }

    hasProperty(key) {
        if (this.properties.has(key)) {
            return true
        } else if (this.parent) {
            return this.parent.hasProperty(key)
        } else {
            return false
        }
    }

    get format() {
        const type = this.getProperty("type")
        if (type) {
            // Trim extra bed qualifiers (e.g. bigBed + 4)
            return firstWord(type)
        }
        return undefined // unknown type
    }

    /**
     * IGV display mode
     */
    get displayMode() {
        let viz = this.getProperty("visibility")
        if (!viz) {
            return "COLLAPSED"
        } else {
            viz = viz.toLowerCase()
            switch (viz) {
                case "dense":
                    return "COLLAPSED"
                case "pack":
                    return "EXPANDED"
                case "squish":
                    return "SQUISHED"
                default:
                    return "COLLAPSED"
            }
        }
    }
}


/**
 * Return the content length of the resource.  If the content length cannot be determined return null;
 * @param url
 * @returns {Promise<number|string>}
 */
async function getContentLength(url) {
    try {
        const response = await fetch(url, {method: 'HEAD'})
        const headers = response.headers
        if (headers.has("content-length")) {
            return headers.get("content-length")
        } else {
            return null
        }
    } catch (e) {
        return null
    }
}

/**
 * Parse a UCSC  file
 * @param url
 * @returns {Promise<*[]>}
 */
async function loadStanzas(url) {

    const response = await fetch(url)
    const data = await response.text()
    const lines = data.split(/\n|\r\n|\r/g)

    const nodes = []
    let currentNode
    let startNewNode = true
    for (let line of lines) {
        const indent = indentLevel(line)
        const i = line.indexOf(' ', indent)
        if (i < 0) {
            // Break - start a new node
            startNewNode = true
        } else {
            const key = line.substring(indent, i).trim()
            if (key.startsWith("#")) continue
            const value = line.substring(i + 1).trim()
            if (startNewNode) {
                // Start a new node -- indent is currently ignored as igv.js does not support sub-tracks,
                // so track stanzas are flattened
                const newNode = new Stanza(key, value)
                nodes.push(newNode)
                currentNode = newNode
                startNewNode = false
            }
            currentNode.setProperty(key, value)
        }
    }

    return resolveParents(nodes)
}

function resolveParents(nodes) {
    const nodeMap = new Map()
    for (let n of nodes) {
        nodeMap.set(n.name, n)
    }
    for (let n of nodes) {
        if (n.properties.has("parent")) {
            const parentName = firstWord(n.properties.get("parent"))
            n.parent = nodeMap.get(parentName)
        }
    }
    return nodes
}

function indentLevel(str) {
    let level = 0
    for (level = 0; level < str.length; level++) {
        const c = str.charAt(level)
        if (c !== ' ' && c !== '\t') break
    }
    return level
}


export {loadStanzas}
export default Hub
