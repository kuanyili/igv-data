// GCF_000001405.40	GRCh38.p14	Homo sapiens	human (GRCh38.p14 2022)	9606	primates(L)
//A. thaliana (TAIR 10)	https://raw.githubusercontent.com/igvteam/igv-genomes/refs/heads/main/json/tair10.json	tair10


const fs = require('fs')


const fd = fs.openSync('../genomes.2.txt', 'w')
const data = fs.readFileSync('../genomes.txt', 'utf8');

//# accession	assembly	scientific name	common name	taxonId	GenArk clade

(async () => {
    const url = 'https://api.genome.ucsc.edu/list/ucscGenomes'
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const jsonData = await response.json()
        const genomes = jsonData.ucscGenomes

        const lines = data.split('\n')
        for (let line of lines) {
            if (line.startsWith('#')) {
                fs.writeSync(fd, '#url\taccession\tscientific name\tcommon name\ttaxonId\n')
            } else {
                const columns = line.split('\t')
                const genomeId = columns[2]
                const commonName = columns[0]
                const url = columns[1]

                const ucscGenome = genomes[genomeId]
                const scientificName = ucscGenome ? ucscGenome.scientificName : ''
                const taxonId = ucscGenome ? ucscGenome.taxId : ''

                fs.writeSync(fd, `${url}\t${genomeId}\t${scientificName}\t${commonName}\t${taxonId}\n`)

                // Process the data as needed
                //console.log(`Genome ID: ${genomeId}, Genome Name: ${genomeName}, Scientific Name: ${scientificName}, Common Name: ${commonName}, Taxon ID: ${taxonId}, Clade: ${clade}`);
            }
        }
        fs.closeSync(fd)

    } catch (error) {
        console.error('Error fetching or parsing data:', error)
    }
})()

const ex = {
    "description": "Feb. 2013 (WBcel235/ce11)",
    "nibPath": "/gbdb/ce11",
    "organism": "C. elegans",
    "defaultPos": "chrII:14646376-14667875",
    "active": 1,
    "orderKey": 3024,
    "genome": "C. elegans",
    "scientificName": "Caenorhabditis elegans",
    "htmlPath": "/gbdb/ce11/html/description.html",
    "hgNearOk": 0,
    "hgPbOk": 0,
    "sourceName": "C. elegans Sequencing Consortium WBcel235 (GCA_000002985.3)",
    "taxId": 6239
}