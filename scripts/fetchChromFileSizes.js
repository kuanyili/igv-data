


    (async () => {

        const fs = require('fs')
        const fd = fs.openSync('output/contigCountSizes.txt', 'w')
        const url = 'https://hgdownload.soe.ucsc.edu/hubs/UCSC_GI.assemblyHubList.txt'
        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.text()
            const lines = data.split('\n')
            for (let line of lines) {
                if (line.startsWith('#') || line.trim().length === 0) continue

                const accession = line.split('\t')[0]
                const hubDirectory = getHubDirectory(accession)
                const chromSizesURL = hubDirectory + accession + ".chrom.sizes.txt"

                const headResponse = await fetch(chromSizesURL, {method: 'HEAD'})
                if (headResponse.ok) {
                    const contentLength = headResponse.headers.get('content-length')
                    fs.writeSync(fd, `${accession}\t${contentLength}\t${chromSizesURL}\n`)
                    console.log(fd, `${accession}\t${contentLength}\t${chromSizesURL}\n`)
                } else {
                    console.error(`Failed to fetch HEAD for ${chromSizesURL}:`, headResponse.status)
                }

                await new Promise(resolve => setTimeout(resolve, 500))
            }

            fs.closeSync(fd)

        } catch (error) {
            console.error('Error fetching or parsing data:', error)
        }
    })()


function getHubDirectory(accension) {
    //https://hgdownload.soe.ucsc.edu/hubs/GCF/016/808/095/GCF_016808095.1/
    //https://hgdownload.soe.ucsc.edu/hubs/GCA/028/534/965/GCA_028534965.1/
    if (accension.startsWith("GCF") || accension.startsWith("GCA") && accension.length >= 13) {
        const prefix = accension.substring(0, 3)
        const n1 = accension.substring(4, 7)
        const n2 = accension.substring(7, 10)
        const n3 = accension.substring(10, 13)
        return "https://hgdownload.soe.ucsc.edu/hubs/" + prefix + "/" + n1 + "/" + n2 + "/" + n3 + "/" + accension + "/"
    } else {
        return null
    }
}