const express = require("express");
const router = express.Router();
const question = require("../models/question");

/* GET home page. */
router.get("/", function(req, res, next) {
    question.find()
        .exec()
        .then(docs => {
            if (req.user){
                res.render("index", { questions: docs.reverse(), user : req.user });
            } else {
                res.render("index", { questions: docs.reverse()});
            }
        })
        .catch(err => {
            res.status(200).json({
                error: err
            });
        }); 
});

router.post("/:tag/sort", function(req, res) {
    const id = req.params.tag;
    question.find({tags : id})
        .then(docs => {
            if (req.user){
                res.render("index", { questions: docs.reverse(), user : req.user });
            } else {
                res.render("index", { questions: docs.reverse()});
            }
        })
        .catch(err => {
            res.status(200).json({
                error: err
            });
        }); 
});

module.exports = router;