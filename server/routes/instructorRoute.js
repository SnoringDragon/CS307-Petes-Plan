const { Router } = require('express');
const mongoose = require('mongoose');

const Instructor = require('../models/instructorModel');

module.exports = app => {
    const router = Router();

    router.get('/', async (req, res) => {
        if (typeof req.query.id !== 'string' && typeof req.query.email !== 'string')
            return res.status(400).json({ message: 'invalid input' });

        const filter =  {};

        if (req.query.id) {
            try {
                filter._id = mongoose.Types.ObjectId(req.query.id);
            } catch {
                return res.status(400).json({message: 'invalid id '});
            }
        } else {
            filter.email = req.query.email;
        }

        return res.json(await Instructor.findOne(filter));
    });

    router.get('/search', async (req, res) => {
        if (typeof req.query.q !== 'string')
            return res.status(400).json({ message: 'invalid input' });

        return res.json(await Instructor.find({
            $text: { $search: req.query.q }
        }).sort({
            score: { $meta: 'textScore' }
        }))
    });

    app.use('/api/instructors', router);
};