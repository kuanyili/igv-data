var convert = require('xml-js')

//sample	pop	super_pop	gender
//HG00096	GBR	EUR	male
const metadata = new Map()
const popNames = new Map()
const superpopNames = new Map()
const popSuperMap = new Map()

const meta = require('fs').readFileSync('igsr_samples.tsv', 'utf8')
const lines = meta.split(/\r?\n|\r|\n/g)
for (let line of lines) {
    const tokens = line.split('\t')

    metadata.set(tokens[0], {
        pop: tokens[3],
        super_pop: tokens[5],
        gender: tokens[1]
    })

    popNames.set(tokens[3], tokens[4])
    superpopNames.set(tokens[5], tokens[6])
    popSuperMap.set(tokens[3], tokens[5])
}

const xml = require('fs').readFileSync('1KG.s3.xml', 'utf8')

const result = convert.xml2js(xml)    // to convert xml text to javascript object

const global = result.elements[0]
//
// HG00097	GBR	EUR	female
// HG00099	GBR	EUR	female
// HG00100	GBR	EUR	female

const alignments = global.elements[4]

const sMap = new Map()

for (let pop of alignments.elements) {

    const popName = pop.attributes.name
    const popMap = sMap.get(popName) || sMap.set(popName, new Map()).get(popName)

    for (let type of pop.elements) {

        const typeKey = type.attributes.name === 'exome' ? 'Exome' : 'Low_Coverage'
        const trackList = popMap.get(typeKey) || popMap.set(typeKey, []).get(typeKey)

        for (let track of type.elements) {

            const name = track.attributes.name.substring(0, 7)
            const sampleMetadata = metadata.get(name)
            if (!sampleMetadata.pop.includes(pop.attributes.name)) {
                throw Error(`mismatched pop key ${sampleMetadata.pop} ${pop.attributes.name}`)
            }
            trackList.push(track)
        }
    }
}


// console.log()
// console.log(`track ${type}`)
// console.log(`shortLabel ${type.replace("_", " ")}`)
// console.log(`longLabel ${type.replace("_", " ")}`)
// console.log(`superTrack on`)


for (let popName of sMap.keys()) {

    console.log()
    console.log(`track ${popName}`)
    console.log(`shortLabel ${popNames.has(popName) ? popNames.get(popName) : popName} Alignments`)
    //console.log(`longLabel ${popNames.get(popName)}`)
    console.log(`compositeTrack on`)

    const typeMap = sMap.get(popName)

    for (let type of typeMap.keys()) {

        console.log()
        console.log(`track ${popName}_${type}`)
        console.log(`shortLabel ${type}`)
        //console.log(`longLabel ${type}`)
        console.log(`parent ${popName}`)
        console.log(`view on`)

        const trackList = typeMap.get(type)
        for (let track of trackList) {

            const label = track.attributes.name
            const name = label.substring(0, 7)
            const sampleMetadata = metadata.get(name)
            const pop = popNames.get(sampleMetadata.pop)

            console.log()
            console.log(`track ${name}`)
            console.log(`shortLabel ${label}`)
            console.log(`longLabel ${label}`)
            console.log(`bigDataUrl ${track.attributes.path}`)
            console.log(`bigDataIndex ${track.attributes.path}.bai`)
            console.log('type bam')
            console.log(`parent ${popName}_${type}`)


            const spName = superpopNames.get(sampleMetadata.super_pop)
            const m = `metadata population="${pop}" super_pop="${spName}" gender=${sampleMetadata.gender}"`
            console.log(m)
        }
    }
}





