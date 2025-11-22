const Grade = require("../models/grade");

const GradeController = {
    async getAll(req, res) {
        const { className, userId } = req.query;
        try {
            const grades = await Grade.getAllByClassName(userId, className );
            res.status(200).json({ success: true, rows: grades });
        } catch (error) {
            res.status(400).json({ success: false });
        }
    },

    async getAverages(req, res) {
        const { userId, className } = req.query;
        try {
            const averages = await Grade.getAverages(userId, className);
            res.status(200).json({ success: true, rows: averages });
        } catch (error) {
            res.status(400).json({ success: false });
        }
    },

    async create(req, res) {
        const { activityScore, activityId, studentId, userId, className } = req.body;
        try {
            await Grade.create(activityScore, activityId, studentId, className, userId);
            res.status(201).json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    async getOverallApprovalRate(req, res) {
        const { userId } = req.query;
        try {
            const rate = await Grade.getOverallApprovalRate(userId);
            res.status(200).json({ success: true, rate });
        } catch (error) {
            res.status(400).json({ success: false });
        }
    },
};

module.exports = GradeController;
