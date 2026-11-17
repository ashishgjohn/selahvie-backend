import Image from "../models/imageModel.js";
import catchAsync from "../utils/catchAsync.js";

const getRandomImage = catchAsync(async (req, res, next) => {
    const images = await Image.aggregate([{ $sample: { size: 1 } }]);
    const baseUrl = `${(process.env.NODE_ENV||'').toLowerCase()==='production'?'https':req.protocol}://${req.get('host')}`;
    const img = images[0] ?? { name: 'img0.jpg' };
    const imageWithUrl = {
        ...img,
        name: `${baseUrl}/imgs/bgs/${img.name}`,
    };

    res.status(200).json({
        status: 'success',
        data: imageWithUrl
    });
});

export { getRandomImage };
