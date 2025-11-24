const Class = require("../models/class");

const ClassController = {
    async create(req, res) {
        const { name, course, icon, userId } = req.body;
        try {
            await Class.create(name, course, icon, userId);
            return res.status(201).json({ success: true });
        } catch (error) {
            if (error.code === "SQLITE_CONSTRAINT") {
                return res.status(400).json({ success: false, errorId: "class-exists" });
            } else {
                return res.status(400).json({ success: false });
            }
        }
    },

    async getAll(req, res) {
        const { userId } = req.query;
        try {
            const rows = await Class.getAllByUser(userId);
            res.status(201).json({ success: true, rows });
        } catch (error) {
            res.status(400).json({ success: false });
        }
    },

    async delete(req, res) {
        const { id, userId } = req.body;
        try {
            await Class.delete(id, userId);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false, error: error });
        }
    },

    async getTopApprovedClass(req, res) {
        const { userId } = req.query;
        try {
            const classroom = await Class.getTopApprovedClass(userId);
            console.log(classroom);
            res.status(200).json({ success: true, classroom });
        } catch (error) {
            console.log(error);
            res.status(400).json({ success: false, error: error });
        }
    },

    async getTopFailureClass(req, res) {
        const { userId } = req.query;
        try {
            const classroom = await Class.getTopFailureClass(userId);
            console.log(classroom);
            res.status(200).json({ success: true, classroom });
        } catch (error) {
            console.log(error);
            res.status(400).json({ success: false, error: error });
        }
    }
};

module.exports = ClassController;
