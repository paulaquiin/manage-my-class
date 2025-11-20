const Activity = require("../models/activity");

const ActivityController = {
    async create(req, res) {
        const { name, type, userId, className, quarterActivity } = req.body;
        try {
            const activityId = await Activity.create(name, type, userId, className, quarterActivity);
            res.status(201).json({ success: true, activityId });
        } catch (error) {
            res.status(400).json({ success: false });
        }
    },

    async update(req, res) {
        const { name, quarterActivity, activityId } = req.body;
        try {
            await Activity.update(activityId, name, quarterActivity );
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false });
        }
    },

    async getAll(req, res) {
        const { userId, type, className } = req.query;
        try {
            const activities = await Activity.getByUserAndClass(userId, className, type,);
            res.status(200).json({ success: true, rows: activities });
        } catch (error) {
            res.status(400).json({ success: false });
        }
    }
};

module.exports = ActivityController;
