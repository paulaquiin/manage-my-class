const db = require("../database");

class Class {
    constructor(id, name, grade, icon, userId, studentsQty) {
        this.id = id;
        this.name = name;
        this.grade = grade;
        this.icon = icon;
        this.userId = userId;
        this.studentsQty = studentsQty;
    }

    static create(name, course, icon, userId) {
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO classes (name, grade, icon, user_id) VALUES (?, ?, ?, ?)",
                [name, course, icon, userId],
                function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    static getAllByUser(userId) {
        return new Promise((resolve, reject) => {
            db.all(
                `
                    SELECT c.*, 
                    COUNT(s.id) AS students_qty
                    FROM classes c
                    LEFT JOIN student_classes sc ON sc.class_id = c.id
                    LEFT JOIN students s ON s.id = sc.student_id
                    WHERE c.user_id = ?
                    GROUP BY c.id
                `,
                [userId],
                function (error, rows) {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(rows.map(row => new Class(row.id, row.name, row.grade, row.icon, row.user_id, row.students_qty)));
                    }
                });
        });
    }

    static delete(id, userId) {
        return new Promise((resolve, reject) => {
            db.run(
                "DELETE FROM classes WHERE id = ? AND user_id = ?",
                [id, userId],
                function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(true);
                    } 
                });
        });
    }
}

module.exports = Class