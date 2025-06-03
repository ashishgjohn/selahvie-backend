import { escape } from 'html-escaper';  // To prevent XSS attacks
import catchAsync from "../utils/catchAsync.js";

const handleShare = catchAsync(async (req, res, next) => {
    const verse = escape(req.query.verse || '');
    const reference = escape(req.query.reference || '');
    const imageUrl = escape(req.query.imageUrl || '');
    
    // If someone visits directly without parameters
    if (!verse || !reference || !imageUrl) {
        return res.redirect('https://selahvie.life');
    }

    // Send the sharing page with Open Graph tags
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SelahVie - Daily Verse</title>
            <meta property="og:title" content="Daily Verse | SelahVie" />
            <meta property="og:description" content="${verse} - ${reference}" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:url" content="https://selahvie.life" />
            <meta property="og:type" content="website" />
            <meta http-equiv="refresh" content="0;url=https://selahvie.life" />
        </head>
        <body>
            <p>Redirecting to SelahVie...</p>
        </body>
        </html>
    `);
});

export { handleShare };