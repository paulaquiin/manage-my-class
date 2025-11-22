const db = require("../database");

class Student {
    constructor(id, student_name, surname, photo, className, icon, grade) {
        this.id = id;
        this.student_name = student_name;
        this.surname = surname;
        this.class_name = className;
        this.icon = icon;
        this.photo = photo;
        this.grade = grade;
    }

    static create(name, surname, photo, classes, userId) {
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO students (name, surname, photo, user_id) VALUES (?, ?, ?, ?)",
                [name, surname, photo, userId],
                function (error) {
                    if (error) {
                        return reject(error);
                    }
                    const studentId = this.lastID;
                    classes.forEach(element => {
                        db.run(
                            "INSERT INTO student_classes (student_id, class_id, user_id) VALUES (?, ?, ?)",
                            [studentId, element, userId],
                            function (error2) {
                                if (error2) {
                                    reject(error2);
                                } else {
                                    resolve(new Student(studentId, name, surname, photo));
                                }
                            }
                        );
                    });
                }
            );
        });
    }

    static getAllByUser(userId) {
        return new Promise((resolve, reject) => {
            db.all(
                `
                    SELECT 
                    s.id,
                    s.name AS student_name,
                    s.surname,
                    s.photo,
                    s.user_id,
                    c.id AS class_id,
                    c.name AS class_name,
                    c.icon,
                    c.grade
                    FROM students s
                    LEFT JOIN student_classes sc ON sc.student_id = s.id
                    LEFT JOIN classes c ON c.id = sc.class_id
                    WHERE s.user_id = ?
                `,
                [userId],
                function (error, rows) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(rows.map(row => new Student(row.id, row.student_name, row.surname, row.photo, row.class_name, row.icon, row.grade)));
                    }
                }
            );
        });
    }

    static getAllByClassName(userId, className) {
        return new Promise((resolve, reject) => {
            db.all(
                `
                    SELECT 
                    s.id,
                    s.name,
                    s.surname
                    FROM students s
                    JOIN student_classes sc ON s.id = sc.student_id
                    JOIN classes c ON sc.class_id = c.id
                    WHERE s.user_id = ? AND c.name = ?;
                `,
                [userId, className],
                function (error, rows) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(rows.map(row => new Student(row.id, row.name, row.surname)));
                    }
                }
            );
        });
    }

    static delete(id, className, userId) {
        return new Promise((resolve, reject) => {
            db.run(
                `
                    DELETE FROM student_classes 
                    WHERE student_id = ? AND class_id = (SELECT id FROM classes WHERE name = ? AND user_id = ?) AND user_id = ?
                `,
                [id, className, userId, userId],
                function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        db.get(
                            `
                                SELECT COUNT(*) AS total 
                                FROM student_classes 
                                WHERE student_id = ? AND user_id = ?
                            `,
                            [id, userId],
                            function (error2, result) {
                                if (error2) {
                                    return reject(error2);
                                }
                                if (result.total === 0) {
                                    db.run(
                                        `
                                            DELETE FROM students 
                                            WHERE id = ? AND user_id = ?
                                        `,
                                        [id, userId],
                                        function (error3) {
                                            if (error3) {
                                                return reject(error3);
                                            }
                                            resolve(true);
                                        }
                                    );
                                } else {
                                    resolve(true);
                                }
                            }
                        );
                    }
                }
            );
        });
    }

    static getTotalByUser(userId) {
        return new Promise((resolve, reject) => {
            db.get(
                `
                    SELECT COUNT(*) AS total_students
                    FROM students
                    WHERE user_id = ?;
                `,
                [userId],
                (error, row) => {
                    console.log(row);
                    console.log(error);
                    if (error) {
                        reject(error);
                    } else {
                        resolve(row ? row.total_students : 0);
                    }
                }
            );
        });
    }

}

module.exports = Student