const express = require('express');
const router = express.Router();
const Game = require('../models/game.js');
const moment = require('moment');
const {
    buildGame
} = require('../services/game-factory');

router.post('/:id/remove', async (req, res) => {
    if (!(req.isAuthenticated())) {
        res.redirect('/users/login');
    }
    console.log(req.isAuthenticated())
    try {
        console.log('received a request to remove a game');
        console.log(req.body);
        if (typeof req.body.word === "string") {
            req.body.word = [req.body.word];
        }
        let game = await Game.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $pullAll: {
                'answers': req.body.word
            }
        }, {
            new: true
        });
        console.log(game)
        res.setHeader('Cache-Control', 'no-cache');
        res.render('game', { user: 'req.user.email', game: game });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: err.message,
        })
    }
});

router.get('/today', async (req, res) => {
    try {
        console.log('received a request for today\'s game');
        const game = await Game.findOne({
            date: new Date(moment().format("YYYY-MM-DD")),
            draft: false
        });
        if (game == null) {
            return res.status(404).json({
                message: `No game found for today: ${req.params.date}`
            });
        }
        res.json(game);
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
});

// get a game by the date
router.get('/date/:date', async (req, res) => {
    try {
        console.log('received a request for a game by its date');
        const game = await Game.findOne({
            date: new Date(req.params.date),
            draft: false
        });
        if (game == null) {
            return res.status(404).json({
                message: `No game found for the date: ${req.params.date}`
            });
        }
        res.json(game);
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
});

// get a game by id
router.get('/:id', async (req, res) => {
    try {
        console.log('received a request for a game')
        const game = await Game.findById(req.params.id);
        if (game == null) {
            return res.status(404).json({
                message: 'The requested game doesn\'t exist'
            });
        }
        res.json(game);
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
});

// get all games
router.get('/', async (req, res) => {
    try {
        console.log('received a request for all the games');
        const games = await Game.find({
            draft: false
        });
        if (games == null) {
            return res.status(404).json({
                message: 'No games were found'
            });
        }
        res.json(games)
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
});

// authenticated routes within admin panel

// create a game
router.post('/', async (req, res) => {
    try {
        console.log('received a game post request');
        const newGame = await buildGame();
        console.log('game succesfully built')
        res.json(newGame);
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
});

// update a game

// delete a game

module.exports = router;