var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");

const Question = require("../models/question");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('question', { title: 'Express' });
});

router.get('/:questionId', function(req, res, next) {
    const id = req.params.questionId;
    Question.findById(id)
        .exec()
        .then(function(doc){
            console.log("From database", doc);
            if (doc){
                res.render('question', { question: doc });
            } else {
                res.status(404).json({message: "No valid entry found for provided id"});
            }
        })
        .catch(function(err){
            console.log(err);
            res.status(500).json({
                error:err
            });
        });
});

router.patch('/:questionId/up', function(req, res, next) {
    const id = req.params.questionId;
    Question.update({_id : id},{$inc : {'nbOfVotes' : 1}})
        .exec()
        .then(function(result){
            res.redirect('back');
        })
        .catch(function(err){
            console.log(err);
            res.status(500).json({error:err});
        });
});

router.patch('/:questionId/down', function(req, res, next) {
    const id = req.params.questionId;
    Question.update({_id : id},{$inc : {'nbOfVotes' : -1}})
        .exec()
        .then(function(result){
            res.redirect('back');
        })
        .catch(function(err){
            console.log(err);
            res.status(500).json({error:err});
        });
});

router.patch('/:questionId/reply', function(req, res, next) {
    const id = req.params.questionId;
    const txt = req.body.repform;
    Question.update({_id : id},{ $push: { replies: {textRep: txt ,nbOfVotesRep: 0, accepted: false}}})
        .exec()
        .then(function(result){
            res.redirect('back');
        })
        .catch(function(err){
            console.log(err);
            res.status(500).json({error:err});
        });
});

module.exports = router;


