import Verse from "../models/verseModel.js";
import Image from "../models/imageModel.js";
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
    let images = await Image.aggregate([{ $sample: { size: 5 } }]);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    images = images.map((img) => {
        return {
            ...img,
            name: `${baseUrl}/imgs/bgs/${img.name}`,
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            images,
            verses
        }
    });
});

export { getAllVerses, getVersesWithScore };