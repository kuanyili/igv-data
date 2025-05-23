// Utility script for extacting a subset of a MAF file based on a list of samples.
// Edit 'inputFilePath' and
// Edit 'inputFilePath' and 'outputFilePath' to the input and output file paths respectively.

const fs = require('fs');
const readline = require('readline');

const inputFilePath = 'TCGA.BRCA.mutect.995c0111-d90b-4140-bee7-3845436c3b42.DR-10.0.somatic.maf';
const outputFilePath = 'TCGA.BRCA.mutect.somatic.maf';

// List of strings to filter by
const filterStrings = [
    "TCGA-3C-AAAU-01A-11D-A41F-09", "TCGA-3C-AALI-01A-11D-A41F-09",
    "TCGA-3C-AALJ-01A-31D-A41F-09", "TCGA-3C-AALK-01A-11D-A41F-09",
    "TCGA-4H-AAAK-01A-12D-A41F-09"
];

async function filterFile(inputFilePath, outputFilePath, filterStrings) {
    const fileStream = fs.createReadStream(inputFilePath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    const outputStream = fs.createWriteStream(outputFilePath);

    for await (const line of rl) {
        if (filterStrings.some(str => line.includes(str))) {
            outputStream.write(line + '\n');
        }
    }

    outputStream.close();
    console.log(`Filtered file written to: ${outputFilePath}`);
}

filterFile(inputFilePath, outputFilePath, filterStrings).catch(err => {
    console.error('Error filtering file:', err);
});