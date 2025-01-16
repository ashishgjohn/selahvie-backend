import Image from "../models/imageModel.js";
import catchAsync from "../utils/catchAsync.js";

const getRandomImage = catchAsync(async (req, res, next) => {
    const images = await Image.aggregate([{ $sample: { size: 1 } }]);
    const baseUrl = `https://${req.get('host')}`;
    const imageWithUrl = {
        ...images[0],
        name: `${baseUrl}/imgs/bgs/${images[0].name}`,
    };

    res.status(200).json({
        status: 'success',
        data: imageWithUrl
    });
});

export { getRandomImage };
