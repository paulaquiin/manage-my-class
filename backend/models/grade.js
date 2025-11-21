const db = require("../database");

class Grade {
    constructor(id, score, activityId, studentId, classId, userId) {
        this.id = id;
        this.score = score;
        this.activityId = activityId;
        this.studentId = studentId;
        this.classId = classId;
        this.userId = userId;
    }

    static create(score, activityId, studentId, className, userId) {
        return new Promise((resolve, reject) => {
            db.run(
                `
                    INSERT INTO grades (score, activity_id, student_id, class_id, user_id)
                    VALUES (?, ?, ?, (SELECT id FROM classes WHERE name = ? AND user_id = ?), ?)
                    ON CONFLICT(activity_id, student_id, class_id, user_id)
                    DO UPDATE SET score = excluded.score
                `,
                [score, activityId, studentId, className, userId, userId],
                function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(true);
                    }
                });
        });
    }

    static getAllByClassName(userId, className) {
        return new Promise((resolve, reject) => {
            db.all(
                `
                    SELECT g.*
                    FROM grades g
                    JOIN classes c ON g.class_id = c.id
                    WHERE c.name = ? AND g.user_id = ?;
                `,
                [className, userId],
                function (error, rows) {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    static getAverages(userId, className) {
        return new Promise((resolve, reject) => {
            db.all(
                `
                    SELECT 
                    g.student_id, 
                    a.quarter, 
                    ROUND(
                        SUM(
                            g.score * 
                            CASE 
                                WHEN a.type = "exam" THEN u.examPercentage 
                                WHEN a.type = "activity" THEN u.activityPercentage 
                                ELSE 0
                            END
                        ) 
                        / 
                        SUM(
                            CASE 
                                WHEN a.type = "exam" THEN u.examPercentage 
                                WHEN a.type = "activity" THEN u.activityPercentage 
                                ELSE 0
                            END
                        ), 
                        1
                    ) AS score
                    FROM grades g
                    JOIN activities a ON g.activity_id = a.id
                    JOIN users u ON g.user_id = u.id
                    WHERE g.user_id = ? AND g.class_id = (SELECT id FROM classes WHERE name = ? AND user_id = ?)
                    GROUP BY g.student_id, a.quarter
                `,
                [userId, className, userId],
                function (error, rows) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(rows);
                    }
                });
        });
    }
}

module.exports = Grade
