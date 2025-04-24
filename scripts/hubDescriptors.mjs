
import fs from 'fs'
import path from 'path'

(async function () {
    await parseJsonFiles('../json', 'hs1.hub.txt')
})()

async function parseJsonFiles(directory) {

    const files = fs.readdirSync(directory);

    const descriptorList = []

    for (const file of files) {
        const filePath = path.join(directory, file);

        if (path.extname(file) === '.json') {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                const jsonData = JSON.parse(content);
                if(jsonData.hubs) {
                    for (const hubURL of jsonData.hubs) {
                        const hubDescriptor = await toHubDescriptor(hubURL)
                        //console.log(JSON.stringify(hubDescriptor, null, 2))
                        descriptorList.push(hubDescriptor)
                    }
                }
            } catch (error) {
                console.error(`Error parsing ${file}:`, error.message);
            }
        }
    }
    fs.writeFileSync('../hubs/hubRegistry.json', JSON.stringify(descriptorList, null, 2), 'utf-8');
}


async function toHubDescriptor(hubURL) {

    const idx = hubURL.lastIndexOf("/")
    const baseURL = hubURL.substring(0, idx + 1)

    // Fetch hub text
    const response = await fetch(hubURL)
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    const text = await response.text()
    const lines = text.split('\n')

    const hubDescriptor = {url: hubURL}
    for (let line of lines) {
        line = line.trim()
        if(line.length == 0) {
            break // Finished with hub stanza
        }
        const i = line.indexOf(' ')
        const key = line.substring(0, i).trim()
        const value = line.substring(i + 1).trim()
        switch(key) {
            case 'shortLabel':
            case 'longLabel':
            case 'descriptionUrl':
                hubDescriptor[key] = value
                break
            case 'html':
                hubDescriptor.descriptionUrl =  value.startsWith("http") ? value : baseURL + value
        }
    }
    return hubDescriptor
}
