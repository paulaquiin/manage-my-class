const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = "1c975aca040f714db40ba0f0fdbf8aad"; // Firma generada en https://jwtsecrets.com/
const JWT_EXPIRATION = "12h";

const UserController = {
    async register(req, res) {
        const { user, password, dni } = req.body;
        try {
            await User.create(user, password, dni);
            return res.status(201).json({ success: true });
        } catch (error) {
            return res.status(400).json({ success: false, errorId: "user-exists-error", message: "Usuario ya existe" });
        }

    },

    async login(req, res) {
        const { user, password } = req.body;
        try {
            const result = await User.getByUsername(user);
            const validPassword = await bcrypt.compare(password, result.password);
            if (!validPassword) {
                return res.status(400).json({ errorId: "password-error", message: "Contraseña incorrecta" });
            } else {
                const token = jwt.sign({ id: result.id }, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRATION });
                return res.status(200).json({ token, user_id: result.id });
            }
        } catch (error) {
            if (error) {
                return res.status(400).json({ success: false });
            } else {
                return res.status(400).json({ errorId: "user-error", message: "El usuario no existe" });

            }
        }

    },

    async getUser(req, res) {
        try {
            const user = await User.getById(req.query.userId);
            return res.status(201).json({ success: true, info: user });

        } catch (error) {
            return res.status(400).json({ success: false });
        }
    },

    async update(req, res) {
        const { userId, user, dni, password, activityPercentage, examPercentage} = req.body;
        try {
            await User.update(userId, user, dni, activityPercentage, examPercentage, password);
            return res.status(201).json({ success: true });

        } catch (error) {
            console.log(error);
            return res.status(400).json({ success: false });
        }
    }
};

module.exports = UserController;