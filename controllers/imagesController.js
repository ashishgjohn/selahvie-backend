import catchAsync from "../utils/catchAsync.js";
import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';

let browserInstance = null;

async function getBrowser() {
    if (!browserInstance || !browserInstance.connected) {
        browserInstance = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    return browserInstance;
}

// Function to clean up old generated images
async function cleanupOldImages() {
    try {
        const imgsDir = 'imgs';
        const files = await fs.readdir(imgsDir);
        const now = Date.now();
        const twoHoursAgo = now - (2 * 60 * 60 * 1000); // 2 hours in milliseconds
        
        for (const file of files) {
            // Only delete facebook-share generated images
            if (file.startsWith('facebook-share-') && (file.endsWith('.png') || file.endsWith('.jpg'))) {
                const filePath = path.join(imgsDir, file);
                const stats = await fs.stat(filePath);
                
                // Delete if older than 2 hours
                if (stats.mtime.getTime() < twoHoursAgo) {
                    await fs.unlink(filePath);
                    console.log(`Cleaned up old image: ${file}`);
                }
            }
        }
    } catch (error) {
        console.error('Error cleaning up old images:', error);
    }
}

const getImageWithVerse = catchAsync(async (req, res, next) => {
    try {
        const { text: verseText, reference: verseReference, image: bgImage } = req.query;
        
        if (!verseText || !bgImage) {
            return res.status(400).json({
                status: 'failure',
                message: 'Missing required parameters: text and image'
            });
        }

        // Read the HTML template
        const templatePath = path.join('templates', 'facebook-share-template.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf8');

        // Clean up old images first
        cleanupOldImages();
        
        // Replace placeholders with actual data
        const backgroundImageUrl = `https://${req.get('host')}/imgs/bgs/${bgImage}`;
        const logoUrl = `https://${req.get('host')}/imgs/SelahVieLogoWhite.webp`;
        
        htmlTemplate = htmlTemplate
            .replace('{{BACKGROUND_IMAGE}}', backgroundImageUrl)
            .replace('{{LOGO_URL}}', logoUrl)
            .replace('{{VERSE_REFERENCE}}', verseReference || '')
            .replace('{{VERSE_TEXT}}', verseText);

        const browser = await getBrowser();
        const page = await browser.newPage();

        await page.setViewport({ width: 1200, height: 630 });
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle2' });

        const outputImageName = `facebook-share-${Date.now()}.jpg`;
        const outputImagePath = path.join('imgs', outputImageName);

        await page.screenshot({
            path: outputImagePath,
            type: 'jpeg',
            quality: 90,
            clip: { x: 0, y: 0, width: 1200, height: 630 }
        });

        await page.close();

        const imageUrl = `https://${req.get('host')}/imgs/${outputImageName}`;

        res.status(200).json({
            status: 'success',
            imageUrl,
        });
    } catch (err) {
        console.error('Error generating Facebook share image:', err);

        res.status(500).json({
            status: 'failure',
            message: 'Failed to generate share image',
            error: err.message
        });
    }
});

export { getImageWithVerse };