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
                score: { $gte: Number(score) - 2 }
            },
            {
                score: { $lte: Number(score) + 2 }
            }
        ]
    });
    const images = await Image.aggregate([{ $sample: { size: 5 } }]);

    res.status(200).json({
        status: 'success',
        data: {
            images,
            verses
        }
    });
});

export { getAllVerses, getVersesWithScore };