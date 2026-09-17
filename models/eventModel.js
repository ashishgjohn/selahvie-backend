import mongoose from "mongoose";

// One row per user action we want to measure (a verse view, a share, etc.).
// Kept deliberately small and anonymous.
const eventSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true          // e.g. 'verse_view', 'share'
    },
    moodScore: {
        type: Number            // -10..10, when the action involves a mood
    },
    anonymousId: {
        type: String            // optional stable per-user id (added later)
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
