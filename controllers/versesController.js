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
    console.log(req.params.score)
    const verses = await Verse.find({
        score: Number(req.params.score)
    });

    res.status(200).json({
        status: 'success',
        data: {
            verses
        }
    });
});

export { getAllVerses, getVersesWithScore };