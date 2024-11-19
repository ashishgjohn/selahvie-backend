import catchAsync from "../utils/catchAsync.js";
import path from 'path';
import { Jimp, loadFont, measureText, measureTextHeight, HorizontalAlign } from 'jimp';
import { SANS_32_WHITE } from "jimp/fonts";

function wrapText(font, text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    words.slice(1).forEach(word => {
        const width = measureText(font, currentLine + ' ' + word);
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });
    lines.push(currentLine);

    return lines.join('\n');
}

const getImageWithVerse = catchAsync(async (req, res, next) => {
    try {
        const { text: verseText, image: bgImage } = req.query;
        const imagePath = path.join('imgs/bgs', bgImage);
        const font = await loadFont(SANS_32_WHITE);

        const image = await Jimp.read(imagePath);
        const text = verseText || "Selahvie";

        const imageWidth = image.bitmap.width;
        const imageHeight = image.bitmap.height;

        const textBackgroundHeight = 100;
        const textImage = new Jimp({ width: imageWidth, height: textBackgroundHeight, color: '#00000059' });
        const maxTextWidth = imageWidth - 2 * 20;

        const wrappedText = measureText(font, text) > maxTextWidth ? wrapText(font, text, maxTextWidth) : text;
        textImage.print({
            font,
            x: 20,
            y: (textBackgroundHeight - measureTextHeight(font, wrappedText, maxTextWidth)) / 2,
            text: {
                text: wrappedText,
                alignmentX: HorizontalAlign.CENTER,
            },
            maxWidth: maxTextWidth
        });

        const finalImageHeight = imageHeight + textBackgroundHeight;
        const finalImage = new Jimp({ width: imageWidth, height: finalImageHeight, color: '#00000059' });

        finalImage
            .composite(image, 0, 0)
            .composite(textImage, 0, imageHeight);

        const outputImageName = `output-${Date.now()}.png`;
        const outputImagePath = path.join('imgs', outputImageName);

        await finalImage.write(outputImagePath);
        const imageUrl = `https://${req.get('host')}/imgs/${outputImageName}`;

        res.status(200).json({
            status: 'success',
            imageUrl
        });
    } catch (err) {
        console.log(err);

        res.status(500).json({
            status: 'failure',
            data: err
        });
    }
});

export { getImageWithVerse };