const { Router } = require('express');
const Course = require('../models/courseModel');
const Section = require('../models/sectionModel');
const Semester = require('../models/semesterModel');

const mongoose = require('mongoose');

module.exports = app => {
    const router = Router();

    const getCourse = async (req, res, next) => {
        const filter = {};

        if (req.query.course) {
            try {
                filter._id = mongoose.Types.ObjectId(req.query.course);
            } catch {
                return res.status(400).json('invalid course id');
            }
        } else if (typeof req.query.subject !== 'string' || typeof req.query.courseID !== 'string') {
            return res.status(400).json({ message: 'invalid input' });
        } else {
            filter.courseID = req.query.courseID;
            filter.subject = req.query.subject;
        }

        req.course = await Course.findOne(filter);
        next();
    };

    router.get('/', getCourse, async (req, res) => {
        const course = req.course.toObject();

        if (!course) return res.json(course);

        const semesterIds = (await Section.aggregate([{
            $match: { course: course._id },
        }, {
            $group: {
                _id: null,
                semesters: { $addToSet: '$semester' }
            }
        }]))[0]?.semesters ?? [];
        course.semesters = await Semester.find({
            _id: {$in: semesterIds}
        });

        return res.json(course);
    });

    router.get('/sections', getCourse, async (req, res) => {
        if (typeof req.query.semester !== 'string')
            return res.status(400).json({ message: 'invalid input' });

        if (!req.course) return res.json([]);

        try {
            mongoose.Types.ObjectId(req.query.semester);
        } catch {
            return res.status(400).json({ message: 'invalid input' });
        }

        return res.json(await req.course.getSections(req.query.semester));
    });

    router.get('/search', async (req, res) => {
        if (typeof req.query.q !== 'string')
            return res.status(400).json({ message: 'invalid input' });

        return res.json(await Course.aggregate([{
            $match: { $text: { $search: req.query.q } }
        }, {
            $sort: { score: { $meta: 'textScore' } }
        }, {
            $limit: 25
        }, {
            $lookup: {
                from: 'sections',
                localField: 'id',
                foreignField: 'course',
                as: 'sections'
            }
        }, {
            $set: {
                semesters: { $setIntersection: [{ $map: {
                            input: '$sections',
                            as: 'section',
                            in: '$$section.semester'
                        }}] }
            }
        }, {
            $lookup: {
                from: 'semesters',
                localField: 'semesters',
                foreignField: '_id',
                as: 'semesters'
            }
        }, {
            $project: { sections: 0 }
        }]));
    });

    /* Return scheduling information for a course */
    router.get('/scheduling', getCourse, async (req, res) => {
        if (!req.course) {
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
