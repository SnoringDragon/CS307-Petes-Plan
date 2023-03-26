const { Router } = require('express');
const Course = require('../models/courseModel');
const Section = require('../models/sectionModel');
const Semester = require('../models/semesterModel');

module.exports = app => {
    const router = Router();

    router.get('/', async (req, res) => {
        if (typeof req.query.subject !== 'string' || typeof req.query.courseID !== 'string')
            return res.status(400).json({ message: 'invalid input' });

        return res.json(await Course.findOne({
            subject: req.query.subject,
            courseID: req.query.courseID
        }));
    });

    router.get('/search', async (req, res) => {
        if (typeof req.query.q !== 'string')
            return res.status(400).json({ message: 'invalid input' });

        return res.json(await Course.find({
            $text: { $search: req.query.q }
        }).sort({
            score: { $meta: 'textScore' }
        }));
    });

    /* Return scheduling information for a course */
    router.get('/scheduling', async (req, res) => {
        /* Check course is valid */
        if (typeof req.query.subject !== 'string' || typeof req.query.courseID !== 'string') {
            return res.status(400).json({ message: 'invalid input' });
        }

        var course = await Course.findOne({ subject: req.query.subject, courseID: req.query.courseID });
        if (!course) {
            return res.status(404).json({
                message: 'Course not found',
                subject: req.query.subject,
                courseID: req.query.courseID
            });
        }

        /* Begin building section search query */
        var sectionQuery = Section.find({ course: course._id });

        /* Check if semester is valid (if provided) */
        if ((req.query.semester !== undefined) ^ (req.query.year !== undefined)) {
            return res.status(400).json({
                message: 'Must provide both/neither semester and year',
            });
        } if (req.query.semester && req.query.year) { // If both semester and year are provided, check if semester is valid
            const semester = await Semester.findOne({ semester: req.query.semester, year: req.query.year });
            
            if (!semester) {
                return res.status(400).json({
                    message: 'Semester/Year not valid',
                    semester: req.query.semester,
                    year: req.query.year
                });
            }

            sectionQuery.where({ semester: semester._id });
        }

        /* Return scheduling information with given criteria */
        const sections = await sectionQuery.populate('semester').populate({
            path: 'meetings',
            populate: {
                path: 'instructors',
                model: 'Instructor'
            }
        }).exec();

        /* Get all instructors */
        var instructors = new Map();
        sections.forEach(section => {
            section.meetings.forEach(meeting => {
                meeting.instructors.forEach(instructor => {
                    instructors.set(instructor._id, instructor);
                });
            });
        });

        /* Export instructors as an array */
        instructors = Array.from(instructors.values());

        return res.status(200).json({
            message: 'Successfully retrieved section and instructor information',
            sections: sections,
            instructors: instructors
        });
    });

    app.use('/api/courses', router);
};
