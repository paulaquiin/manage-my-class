const Student = require("../models/student");

const StudentController = {
    async create(req, res) {
        const { name, surname, photo, classes, userId } = req.body;
        try {
            await Student.create(name, surname, photo, classes, userId);
            res.status(201).json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    async getAll(req, res) {
        const { userId } = req.query;
        try {
            const students = await Student.getAllByUser(userId);
            res.status(200).json({ success: true, rows: students });
        } catch (error) {
            res.status(400).json({ success: false });
        }
    },

    async getAllByClassName(req, res) {
        const { userId, className } = req.query;
        try {
            const students = await Student.getAllByClassName(userId, className);
            res.status(200).json({ success: true, rows: students });
        } catch (error) {
            res.status(400).json({ success: false });
        }
    },

    async delete(req, res) {
        const { id, className, userId } = req.body;
        try {
            await Student.delete(id, className, userId);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
};

module.exports = StudentController;
