import catchAsync from "../utils/catchAsync.js";
import logEvent from "../utils/logEvent.js";

// Only these event types are accepted, so the public endpoint can't be
// filled with arbitrary junk. Add new ones here as the app grows.
const ALLOWED_TYPES = new Set([
    'onboarding_viewed',    // the welcome/how-to page was shown
    'onboarding_cta',       // a button on the welcome page was clicked
    'extension_pinned',     // the toolbar icon is pinned (isOnToolbar === true)
    'sidebar_opened',       // the SelahVie panel was actually opened
    'reminder_set',         // a daily reminder time was saved
]);

const recordEvent = catchAsync(async (req, res, next) => {
    const { type, anonymousId, moodScore, value } = req.body || {};

    if (!type || !ALLOWED_TYPES.has(type)) {
        return res.status(400).json({ status: 'error', message: 'Unknown event type.' });
    }

    const event = { type };
    if (typeof anonymousId === 'string') event.anonymousId = anonymousId.slice(0, 64);
    if (typeof value === 'string') event.value = value.slice(0, 120);
    const parsedMood = Number(moodScore);
    if (!Number.isNaN(parsedMood) && parsedMood >= -10 && parsedMood <= 10) {
        event.moodScore = parsedMood;
    }

    logEvent(event);

    // 202 Accepted — we've taken the event; we don't block on the DB write.
    res.status(202).json({ status: 'success' });
});

export { recordEvent };
