import Verse from "../models/verseModel.js";
import Image from "../models/imageModel.js";
import catchAsync from "../utils/catchAsync.js";
import logEvent from "../utils/logEvent.js";

const getAllVerses = catchAsync(async (req, res, next) => {
    const verses = await Verse.find();

    res.status(200).json({
        status: 'success',
        data: {
            verses
        }
    });
});

const getVersesWithScore = catchAsync(async (req, res, next) => {
    const { score } = req.params;
    const parsedScore = Number(score);
    if (isNaN(parsedScore) || parsedScore < -10 || parsedScore > 10) {
        return res.status(400).json({ status: 'error', message: 'Invalid score. Must be a number between -10 and 10.' });
    }
    const verses = await Verse.find({
        $and: [
            {
                score: { $gte: Number(score) - 2 }
            },
            {
                score: { $lte: Number(score) + 2 }
            }
        ]
    });

    // Get a random image using the same method as randomImageController
    const images = await Image.aggregate([{ $sample: { size: 1 } }]);
    const baseUrl = `https://${req.get('host')}`;
    const imageWithUrl = {
        ...images[0],
        name: `${baseUrl}/imgs/bgs/${images[0].name}`,
    };

    // Record this verse view for usage analytics (non-blocking).
    logEvent({ type: 'verse_view', moodScore: parsedScore });

    res.status(200).json({
        status: 'success',
        data: {
            verses,
            images: [imageWithUrl]
        }
    });
});

export { getAllVerses, getVersesWithScore };
