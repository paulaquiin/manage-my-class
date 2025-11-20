const bcrypt = require("bcrypt");
const db = require("../database");

class User {
    constructor(id, user, password, dni) {
        this.id = id;
        this.user = user;
        this.password = password;
        this.dni = dni;
    }

    static async create(user, password, dni) {
        // Librería para encriptar la contraseña

        const hashedPwd = await bcrypt.hash(password, 10);
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO users (user, password, dni) VALUES (?, ?, ?)",
                [user, hashedPwd, dni],
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
            db.get("SELECT * FROM users WHERE user = ?",
                [username],
                function (error, row) {
                    if (error) {
                        reject(error);
                    } else {
                        if (row) {
                            const user = new User(row.id, row.user, row.password, row.dni)
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
            db.get("SELECT * FROM users WHERE id = ?",
                [id],
                function (error, row) {
                    if (error) {
                        reject(error);
                    } else {
                        const user = new User(row.id, row.user, row.password, row.dni);
                        resolve(user);
                    } 
                }
            );
        });
    }
}

module.exports = User