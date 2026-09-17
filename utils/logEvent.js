import Event from "../models/eventModel.js";

// Fire-and-forget analytics. We do NOT await this: if writing the log
// ever fails, the user still gets their verse — the error is swallowed
// and only printed to the server console.
export default function logEvent(data) {
    Event.create(data).catch((err) =>
        console.error('Analytics write failed:', err.message)
    );
}
