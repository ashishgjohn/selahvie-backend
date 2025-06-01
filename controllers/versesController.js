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

    // Get a random image using the same method as randomImageController
    const images = await Image.aggregate([{ $sample: { size: 1 } }]);
    const baseUrl = `https://${req.get('host')}`;
    const imageWithUrl = {
        ...images[0],
        name: `${baseUrl}/imgs/bgs/${images[0].name}`,
    };

    res.status(200).json({
        status: 'success',
        data: {
            verses,
            images: imageWithUrl  // Now 'images' is defined with actual data
        }
    });

    //res.status(200).json({
    //    status: 'success',
    //    data: {
    //        images
    //    }
    //});
});

export { getAllVerses, getVersesWithScore };
