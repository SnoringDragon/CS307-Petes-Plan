const { Router } = require('express');
const GPACalc = require('../utils/GPACalc');
const Degree = require('../models/degreeModel');

const mongoose = require('mongoose');

module.exports = app => {
    const router = Router();

    const { authenticate } = require('../middleware/authenticate');

    router.get('/cumulativeGPA', authenticate, async (req, res) => {
        const gpa = await GPACalc.cumulativeGPA(req, res);
        return gpa;
    });

    router.get('/semesterGPA', authenticate, async (req, res) => {
        if (typeof req.query.semesterInput !== 'string' || isNaN(req.query.yearInput))
            return res.status(400).json({ message: 'invalid semester input' });

        const gpa = await GPACalc.semesterGPA(req, res, req.query.semesterInput, +req.query.yearInput);
        return gpa;
    });

    router.get('/majorGPA', authenticate, async (req, res) => {
        // if (typeof req.query.major !== 'string')
        //     return res.status(400).json({ message: 'invalid major input' });

        const degreeIds = req.user.degreePlans.flatMap(plan => plan.degrees);

        const degrees = await Degree.find({
            _id: { $in: degreeIds }
        });

        const major = degrees.find(({ type }) => type === 'major');
        const concentrations = degrees.filter(({ type }) => type === 'concentration');

        if (!major) return res.json(null);

        const gpa = await GPACalc.majorGPA(req, res, major, concentrations);
        return gpa;
    });

    app.use('/api/GPA', router);

}