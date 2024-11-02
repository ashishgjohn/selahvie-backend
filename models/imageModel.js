import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const Image = mongoose.model('Verse', imageSchema);
export default Image;