const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var expect = require("chai").expect;
var testing = require("../routes/question");

const replySchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    text: {type: String, required: true},
    score: {type: Number, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, required: true},
    username: String,
    date :  String,
    question: mongoose.Schema.Types.ObjectId,
    accepted: {type: Boolean, required: true},
    rejected: {type: Boolean, required: true},
    users: [{type: String}]
});

const reply = mongoose.model("reply3", replySchema);

const testQuestionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {type: String, required: true},
    text: {type: String, required: true},
    score: {type: Number, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, required: true},
    username: String,
    date: {type: Date, required: true},
    replies: [replySchema],
    tag: [{type: String, required: true}]
});

const questionTest = mongoose.model("questionTests", testQuestionSchema);	
	
describe("The functions in question", function() {	
    it("Verify function getPropertyWithTag with tag C++", function(){	
        expect(testing.getPropertyWithTag("C++")).to.equal("tagCPlusPlus");	
    });
    
    it("Verify function getPropertyWithTag with tag C#", function(){	
        expect(testing.getPropertyWithTag("C#")).to.equal("tagCSharp");	
    });

    it("Verify function getPropertyWithTag with tag Visual Basic", function(){	
        expect(testing.getPropertyWithTag("Visual Basic")).to.equal("tagVisualBasic");	
    });

    it("Verify function getPropertyWithTag with tag Java", function(){	
        expect(testing.getPropertyWithTag("Java")).to.equal("tagJava");	
    });	
});

describe("Database Tests for question page", function() {
    before(function (done) {
        mongoose.connect("mongodb://soen341:soen341@soen341-shard-00-00-ruxjj.mongodb.net:27017,soen341-shard-00-01-ruxjj.mongodb.net:27017,soen341-shard-00-02-ruxjj.mongodb.net:27017/test?ssl=true&replicaSet=SOEN341-shard-0&authSource=admin");
        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error"));
        db.once("open", function() {
            done();
        });
    });

    describe("Test Database", function() {
        var replyID = new mongoose.Types.ObjectId();
        var authordQuestionID = new mongoose.Types.ObjectId();
        var authorID = new mongoose.Types.ObjectId();
        var currentDate = new Date();
        var repliesSet = [];
        var questionID = new mongoose.Types.ObjectId();
        var authorIDReply = new mongoose.Types.ObjectId();

        var newReplyTest = reply({
            _id: replyID,
            text: "text",
            score: 1,
            author: authorIDReply,
            username: "username",
            date :  currentDate,
            question: questionID,
            accepted: false,
            rejected: false
        });

        it("New question with no replies saved to the question test database", function(done) {
            var testNewQuestion = questionTest({
                _id: authordQuestionID,
                title: "title",
                text: "this is a text",
                score: 1,
                author: authorID,
                username: "username",
                date: currentDate,
                replies: repliesSet,
                tag: ["Python", "Java"]
            });
            testNewQuestion.save(done);
        });

        it("Dont save incorrect title format to database", function(done) {
            var wrongSave = questionTest({
                notTitle: "Not a title"
            });
            wrongSave.save(err => {
                if(err) { return done(); }
                throw new Error("Should generate error!");
            });
        });

        it("Able to add answers to the question", function(done) {
            repliesSet.push(newReplyTest);
            questionTest.update({_id : authordQuestionID}, {$set : {"replies" : repliesSet}})
                .exec()
                .then(function(doc){
                //Assert that the question has successfully updated with replies
                    questionTest.findById(authordQuestionID)
                        .exec()
                        .then(function(doc1) {
                            var repliesOfQuesiton = doc1.replies;
                            var foundMatch = false;
                            var foundId;
                            var searchId = replyID.toString();
                            for(var i = 0; i < repliesOfQuesiton.length; ++i) {
                                foundId = repliesOfQuesiton[i]._id.toString();
                                if (foundId == replyID) {
                                    foundMatch = true;
                                }
                            }
                            expect(foundMatch).to.equal(true);
                            done();
                        })
                        .catch(function(err) {
                            res.status(500).json({
                                error:err
                            });
                        });
                })

                .catch(function(err){
                    res.status(500).json({error:err});
                });
        });

        it("Fail to add a reply due to a missing field", function (done) {
            var invalidReply = reply({
                _id: new mongoose.Types.ObjectId(),
                // text field is omitted for the fail test
                score: 1,
                author: new mongoose.Types.ObjectId(),
                username: "username",
                date: new Date(),
                question: new mongoose.Types.ObjectId(),
                accepted: false,
                rejected: false
            });

            invalidReply.save(err => {
                if (err) { return done(); }
                throw new Error("Should generate error!");
            });
        });

        it("Fail to update a reply that does not exist", function (done) {
            var error = false;
            questionTest.update(
                { replies: { $elemMatch: { _id: 0 } } }, { $inc: { "score": 1 } }
            )
                .exec()
                .catch(function (err) {
                    error = true;
                    return done();
                })
                .then(function () {
                    if (!error) {
                        throw new Error("Should generate error!");
                    }
                });
        });

        it("Able to test up votes for the question", function(done) {
            questionTest.findById(authordQuestionID)
                .exec()
                .then(function(doc){
                    var oldQuestionScore = doc.score;
                    questionTest.update({_id : authordQuestionID}, {$inc : {"score" : 1}})
                        .exec()
                        .then(function(doc){
                            //Assert that the question's score has sucessfully incremented
                            questionTest.findById(authordQuestionID)
                                .exec()
                                .then(function(doc1) {
                                    var newQuestionScore = doc1.score;
                                    expect(newQuestionScore).to.equal(oldQuestionScore + 1);
                                    done();
                                })
                                .catch(function(err) {
                                    res.status(500).json({
                                        error:err
                                    });
                                });
                        })
                        .catch(function(err) {
                            res.status(500).json({
                                error:err
                            });
                        });
                
                })
                .catch(function(err){
                    res.status(500).json({
                        error:err
                    });
                });
        });

        it("Able to test down votes for the question", function(done) {
            questionTest.findById(authordQuestionID)
                .exec()
                .then(function(doc){
                    var oldQuestionScore = doc.score;
                    var updateQuestionScore = doc.score - 1;
                    questionTest.update({_id : authordQuestionID}, {$set : {"score" : updateQuestionScore}})
                        .exec()
                        .then(function(doc){
                            //Assert that the question's score has sucesfully decremented
                            questionTest.findById(authordQuestionID)
                                .exec()
                                .then(function(doc1) {         
                                    var newQuestionScore = doc1.score;
                                    expect(newQuestionScore).to.equal(oldQuestionScore - 1);
                                    done();
                                })
                                .catch(function(err) {
                                    res.status(500).json({
                                        error:err
                                    });
                                });
                        })
                        .catch(function(err) {
                            res.status(500).json({
                                error:err
                            });
                        });                
                })
                .catch(function(err){
                    res.status(500).json({
                        error:err
                    });
                });
        });

        it("Should retrieve the reply from test database", function (done) {
            questionTest.findById(authordQuestionID)
                .exec()
                .then(function (doc1) {
                    var repliesOfQuesiton = doc1.replies;
                    var foundMatch = false;
                    var foundId;
                    var searchId = replyID.toString();
                    for (var i = 0; i < repliesOfQuesiton.length; ++i) {
                        foundId = repliesOfQuesiton[i]._id.toString();
                        if (foundId == replyID) {
                            foundMatch = true;
                        }
                    }
                    expect(foundMatch).to.equal(true);
                    done();
                })
                .catch(function (err) {
                    res.status(500).json({
                        error: err
                    });
                });
        });

        it("Able to test up votes for the reply", function (done) {
            questionTest.findById(authordQuestionID)
                .exec()
                .then(function (doc) {
                    var oldReplyScore = doc.replies[0].score;
                    questionTest.update(
                        { replies: { $elemMatch: { _id: replyID } } }, { $inc: { "replies.$.score": 1 } }
                    )
                        .then(function (doc) {
                            //Assert that the reply's score has sucessfully incremented
                            questionTest.findById(authordQuestionID)
                                .exec()
                                .then(function (doc1) {
                                    var newReplyScore = doc1.replies[0].score;
                                    expect(newReplyScore).to.equal(oldReplyScore + 1);
                                    done();
                                })
                                .catch(function (err) {
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        })
                        .catch(function (err) {
                            res.status(500).json({
                                error: err
                            });
                        });
                })
                .catch(function (err) {
                    res.status(500).json({
                        error: err
                    });
                });
        });

        it("Able to test down votes for the reply", function (done) {
            questionTest.findById(authordQuestionID)
                .exec()
                .then(function (doc) {
                    var oldReplyScore = doc.replies[0].score;
                    questionTest.update(
                        { replies: { $elemMatch: { _id: replyID } } }, { $inc: { "replies.$.score": -1 } }
                    )
                        .then(function (doc) {
                            //Assert that the reply's score has sucessfully decremented
                            questionTest.findById(authordQuestionID)
                                .exec()
                                .then(function (doc1) {
                                    var newReplyScore = doc1.replies[0].score;
                                    expect(newReplyScore).to.equal(oldReplyScore - 1);
                                    done();
                                })
                                .catch(function (err) {
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        })
                        .catch(function (err) {
                            res.status(500).json({
                                error: err
                            });
                        });
                })
                .catch(function (err) {
                    res.status(500).json({
                        error: err
                    });
                });
        });


        it("Able to test accepting the reply", function (done) {
            questionTest.findById(authordQuestionID)
                .exec()
                .then(function (doc) {
                    var oldReplyAcceptance = doc.replies[0].accepted;
                    questionTest.update(
                        { replies: { $elemMatch: { _id: replyID } } }, { $set: { "replies.$.accepted": true } }
                    )
                        .then(function (doc) {
                            //Assert that the reply has succesfully been accepted
                            questionTest.findById(authordQuestionID)
                                .exec()
                                .then(function (doc1) {
                                    var newReplyAcceptance = doc1.replies[0].accepted;
                                    expect(newReplyAcceptance).to.equal(!oldReplyAcceptance);
                                    done();
                                })
                                .catch(function (err) {
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        })
                        .catch(function (err) {
                            res.status(500).json({
                                error: err
                            });
                        });
                })
                .catch(function (err) {
                    res.status(500).json({
                        error: err
                    });
                });
        });

        it("Able to test rejecting the reply", function (done) {
            questionTest.findById(authordQuestionID)
                .exec()
                .then(function (doc) {
                    var oldReplyRejection = doc.replies[0].rejected;
                    questionTest.update(
                        { replies: { $elemMatch: { _id: replyID } } }, { $set: { "replies.$.rejected": true } }
                    )
                        .then(function (doc) {
                            //Assert that the reply has succesfully been rejected
                            questionTest.findById(authordQuestionID)
                                .exec()
                                .then(function (doc1) {
                                    var newReplyRejection = doc1.replies[0].rejected;
                                    expect(newReplyRejection).to.equal(!oldReplyRejection);
                                    done();
                                })
                                .catch(function (err) {
                                    res.status(500).json({
                                        error: err
                                    });
                                });
                        })
                        .catch(function (err) {
                            res.status(500).json({
                                error: err
                            });
                        });
                })
                .catch(function (err) {
                    res.status(500).json({
                        error: err
                    });
                });

        });

        it("Should retrieve the question from test database", function(done) {
            questionTest.findById(authordQuestionID)
                .exec()
                .then(function(doc){
                //Assert that we found the correct question
                    questionTest.findById(authordQuestionID)
                        .exec()
                        .then(function(doc1) {         
                            var foundId = doc1._id.toString();
                            var searchId = authordQuestionID.toString();
                            expect(foundId).to.equal(searchId);
                            done();
                        })
                        .catch(function(err) {
                            res.status(500).json({
                                error:err
                            });
                        });
                })
                .catch(function(err){
                    res.status(500).json({
                        error:err
                    });
                });
        });
    });

  
    after(function(done){
        mongoose.connection.db.dropCollection("questiontests", function () {
            mongoose.connection.close(done);
        });
    });
});

