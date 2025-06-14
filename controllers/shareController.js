import { escape } from 'html-escaper';  // To prevent XSS attacks
import catchAsync from "../utils/catchAsync.js";
import { getImageWithVerse } from './imagesController.js';

const handleShare = catchAsync(async (req, res, next) => {
    const format = req.query.format;
    const verse = escape(req.query.verse || '');
    const reference = escape(req.query.reference || '');
    const imageUrl = escape(req.query.imageUrl || '');
    const bgImage = req.query.bgImage || '';
    
    console.log('Share request:', { format, verse, reference, imageUrl, bgImage });
    
    // If format=image is requested, generate and return image
    if (format === 'image') {
        // Transform parameters for image generation
        req.query.text = verse;
        req.query.reference = reference;
        req.query.image = bgImage;
        
        // Call the image generation controller
        return getImageWithVerse(req, res, next);
    }
    
    // If someone visits directly without parameters (but not for image generation)
    if (format !== 'image' && (!verse || !reference || !imageUrl)) {
        return res.redirect('https://selahvie.life');
    }

    // Construct the current share URL for og:url tag
    const currentShareUrl = `https://${req.get('host')}${req.originalUrl}`;
    
    // Send the sharing page with Open Graph tags
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SelahVie</title>
            <meta property="og:title" content="SelahVie" />
            <meta property="og:description" content="A verse for today" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:url" content="${escape(currentShareUrl)}" />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="SelahVie" />
            <meta http-equiv="refresh" content="0;url=https://selahvie.life" />
        </head>
        <body>
            <p>Redirecting to SelahVie...</p>
            <p>If you are not redirected, <a href="https://selahvie.life">click here</a>.</p>
        </body>
        </html>
    `);
});

export { handleShare };
