const fs = require('fs');
        const readline = require('readline');
        const https = require('https');
        const http = require('http');
        const path = require('path');

        const filePath = './url_mappings.tsv';

        async function checkUrl(url) {
            return new Promise((resolve) => {
                try {
                    const parsedUrl = new URL(url);
                    const client = parsedUrl.protocol === 'https:' ? https : http;

                    const req = client.request(url, { method: 'HEAD' }, (res) => {
                        resolve(res.statusCode >= 200 && res.statusCode < 400);
                    });

                    req.on('error', () => resolve(false));
                    req.end();
                } catch (err) {
                    resolve(false); // Handle invalid URLs
                }
            });
        }

        async function downloadFile(url, outputPath) {
            return new Promise((resolve, reject) => {
                try {
                    const parsedUrl = new URL(url);
                    const client = parsedUrl.protocol === 'https:' ? https : http;

                    const req = client.get(url, { headers: { 'User-Agent': 'downloader' } }, (res) => {
                        if (res.statusCode >= 200 && res.statusCode < 400) {
                            const fileStream = fs.createWriteStream(outputPath);
                            res.pipe(fileStream);
                            fileStream.on('finish', () => {
                                fileStream.close(resolve);
                            });
                        } else {
                            reject(new Error(`Failed to download file: ${res.statusCode}`));
                        }
                    });

                    req.on('error', reject);
                } catch (err) {
                    reject(err);
                }
            });
        }

        async function processFile(filePath) {
            const fileStream = fs.createReadStream(filePath);
            const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

            for await (const line of rl) {
                const trimmedLine = line.trim();
                if (!trimmedLine || trimmedLine.startsWith('#')) continue;

                const [firstUrl, secondUrl] = trimmedLine.split('\t');
                if (!secondUrl) continue;

                const isValid = await checkUrl(secondUrl);
                if (!isValid) {
                    console.log(`Failing URL: ${secondUrl}`);
                    // const fileName = path.basename(new URL(firstUrl).pathname);
                    // const outputPath = path.join(process.cwd(), fileName);
                    // try {
                    //     await downloadFile(firstUrl, outputPath);
                    //     console.log(`Downloaded: ${firstUrl} to ${outputPath}`);
                    // } catch (err) {
                    //     console.error(`Failed to download ${firstUrl}:`, err.message);
                    // }
                }
            }
        }

        processFile(filePath).catch((err) => {
            console.error('Error processing file:', err);
        });