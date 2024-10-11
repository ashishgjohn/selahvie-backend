import Verse from "../models/verseModel.js";
import catchAsync from "../utils/catchAsync.js";

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
    const verses = await Verse.find({
        $and: [
            {
                score: { $gte: score - 2 }
            },
            {
                score: { $lte: score + 2 }
            }
        ]
    });

    res.status(200).json({
        status: 'success',
        data: {
            verses
        }
    });
});

export { getAllVerses, getVersesWithScore };