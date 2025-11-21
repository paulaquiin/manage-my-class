const bcrypt = require("bcrypt");
const db = require("../database");

class User {
    constructor(id, user, dni, photo, activityPercentage, examPercentage, password,) {
        this.id = id;
        this.user = user;
        this.dni = dni;
        this.photo = photo;
        this.activityPercentage = activityPercentage;
        this.examPercentage = examPercentage;
        this.password = password;
    }

    static async create(user, password, dni) {
        // Librería para encriptar la contraseña

        const hashedPwd = await bcrypt.hash(password, 10);
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO users (user, password, dni, activityPercentage, examPercentage) VALUES (?, ?, ?, ?, ?)",
                [user, hashedPwd, dni, 50, 50],
                function (error) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(true);
                    }
                }
            );
        })
    }

    static getByUsername(username) {
        return new Promise((resolve, reject) => {
            db.get("SELECT id, user, dni, password FROM users WHERE user = ?",
                [username],
                function (error, row) {
                    if (error) {
                        reject(error);
                    } else {
                        if (row) {
                            const user = new User(row.id, row.user, row.dni, null, null, null, row.password,)
                            resolve(user);
                        } else {
                            reject(null);
                        }
                    }
                }
            );
        });
    }

    static getById(id) {
        return new Promise((resolve, reject) => {
            db.get("SELECT id, user, dni, photo, activityPercentage, examPercentage FROM users WHERE id = ?",
                [id],
                function (error, row) {
                    if (error) {
                        reject(error);
                    } else {
                        const user = new User(row.id, row.user, row.dni, row.photo, row.activityPercentage, row.examPercentage);
                        resolve(user);
                    }
                }
            );
        });
    }

    static update(id, user, dni, photo, activityPercentage, examPercentage, password) {
        return new Promise(async (resolve, reject) => {

            const fields = [];
            const values = [];

            if (user !== "") {
                fields.push("user = ?");
                values.push(user);
            }

            if (dni !== "") {
                fields.push("dni = ?");
                values.push(dni);
            }

            if (photo !== "") {
                fields.push("photo = ?");
                values.push(photo);
            }

            if (activityPercentage !== "") {
                fields.push("activityPercentage = ?");
                values.push(activityPercentage);
            }

            if (examPercentage !== "") {
                fields.push("examPercentage = ?");
                values.push(examPercentage);
            }

            if (password !== "") {
                const hashedPwd = await bcrypt.hash(password, 10);
                fields.push("password = ?");
                values.push(hashedPwd);
            }

            const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
            values.push(id);
            db.run(sql, values, function (error) {
                if (error) {
                    reject(error);
                } else {
                    resolve(true);
                }
            });
        });
    }

}

module.exports = User