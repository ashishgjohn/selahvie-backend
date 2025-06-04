import { escape } from 'html-escaper';  // To prevent XSS attacks
import catchAsync from "../utils/catchAsync.js";

const handleShare = catchAsync(async (req, res, next) => {
    const verse = escape(req.query.verse || '');
    const reference = escape(req.query.reference || '');
    const imageUrl = escape(req.query.imageUrl || '');
    
    console.log(verse, reference, imageUrl);
    
    // If someone visits directly without parameters
    if (!verse || !reference || !imageUrl) {
        return res.redirect('https://selahvie.life');
    }

    // Construct the canonical URL for the og:url tag
    // req.originalUrl includes the path and query string (e.g., /share?verse=...)
    const canonicalUrl = `https://selahvie.life${req.originalUrl}`; 
    // A more dynamic way if your protocol/host might change:
    // const canonicalUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    // Send the sharing page with Open Graph tags
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SelahVie - Daily Verse</title>
            <meta property="og:title" content="Daily Verse | SelahVie" />
            <meta property="og:description" content="${verse} - ${reference}" />
            <meta property="og:image" content="${imageUrl}" />
            <meta property="og:url" content="${escape(canonicalUrl)}" />
            <meta property="og:type" content="website" />
            {/* You might still want the redirect for users, but Facebook should pick up OG tags before redirecting */}
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
