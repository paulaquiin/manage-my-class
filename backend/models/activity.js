const db = require("../database");

class Activity {
    constructor(id, name, type, classId, quarter, userId) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.classId = classId;
        this.quarter = quarter;
        this.userId = userId;
    }

    static create(name, type, userId, className, quarterActivity) {
        return new Promise((resolve, reject) => {
            db.run(
                `
                INSERT INTO activities 
                (
                    type, name, user_id, quarter, class_id) 
                    VALUES ( ?, ?, ?, ?, (SELECT id FROM classes WHERE name = ? AND user_id = ?)
                )
                `,
                [type, name, userId, quarterActivity, className, userId],
                function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    static update(id, name, quarter) {
        return new Promise((resolve, reject) => {
            db.run("UPDATE activities SET name = ?, quarter = ? WHERE id = ?",
                [name, quarter, id],
                function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(true);
                    }
                }
            );
        });
    }

    static getByUserAndClass(userId, className, type) {
        return new Promise((resolve, reject) => {
            db.all(
                `
                    SELECT a.id, a.name, a.type, a.class_id, a.quarter
                    FROM activities a
                    WHERE a.user_id = ? AND a.type = ? AND a.class_id = (SELECT id FROM classes WHERE name = ? AND user_id = ?)
                    ORDER BY a.quarter
                `,
                [userId, type, className, userId],
                function (error, rows) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }
}

module.exports = Activity
