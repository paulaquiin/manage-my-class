const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY; // Firma generada en https://jwtsecrets.com/
const JWT_EXPIRATION = "12h";

const UserController = {
    async register(req, res) {
        const { user, password, dni } = req.body;

        if (password.length < 6) {
            return res.status(400).json({ success: false, errorId: "password-too-short" });
        }

        try {
            const hashedPwd = await bcrypt.hash(password, 10);
            await User.create(user, hashedPwd, dni);
            return res.status(201).json({ success: true });
        } catch (error) {
            return res.status(400).json({ success: false, errorId: "user-exists-error" });
        }

    },

    async login(req, res) {
        const { user, password } = req.body;
        try {
            const result = await User.getByUsername(user);
            const validPassword = await bcrypt.compare(password, result.password);
            if (!validPassword) {
                return res.status(400).json({ errorId: "password-error" });
            } else {
                const token = jwt.sign({ id: result.id }, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRATION });
                return res.status(200).json({ token, user_id: result.id });
            }
        } catch (error) {
            if (error) {
                return res.status(400).json({ success: false });
            } else {
                return res.status(400).json({ errorId: "user-error" });

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
        const { userId, user, dni, photo, password, activityPercentage, examPercentage } = req.body;
        try {
            let hashedPassword = "";
            if (password !== "") {
                if (password.length > 5) {
                    // Comprobar que es una contraseña distinta a la actual
                    const currentUser = await User.getById(userId);
                    const currentHash = currentUser.password;
                    const isSame = await bcrypt.compare(password, currentHash);
                    if (isSame) {
                        return res.status(400).json({ success: false, errorId: "password-repeated" });
                    }
                    hashedPassword = await bcrypt.hash(password, 10);
                } else {
                    return res.status(400).json({ success: false, errorId: "password-too-short" });
                }
            }

            await User.update(userId, user, dni, photo, activityPercentage, examPercentage, hashedPassword);
            return res.status(201).json({ success: true });

        } catch (error) {
            return res.status(400).json({ success: false, errorId: error });
        }
    }
};

module.exports = UserController;