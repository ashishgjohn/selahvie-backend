import mongoose from "mongoose";

const verseSchema = new mongoose.Schema({
    verse: {
        type: String,
        required: true
    },
    reference: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    }
});

verseSchema.index({ score: 1 });

const Verse = mongoose.model('Verse', verseSchema);
export default Verse;