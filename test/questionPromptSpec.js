const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var expect = require("chai").expect;
const Reply = require("../models/reply");
const reply = mongoose.model("reply2", Reply.schema);

const testQuestionSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {type: String, required: true},
    text: {type: String, required: true},
    score: {type: Number, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, required: true},
    username: String,
    date: {type: Date, required: true},
    replies: [Reply.schema]
});

const testQuestions = mongoose.model("testQuestions1", testQuestionSchema);

describe("Connecting to database for question prompt page", function() {
    before(function (done) {
        mongoose.connect("mongodb://soen341:soen341@soen341-shard-00-00-ruxjj.mongodb.net:27017,soen341-shard-00-01-ruxjj.mongodb.net:27017,soen341-shard-00-02-ruxjj.mongodb.net:27017/test?ssl=true&replicaSet=SOEN341-shard-0&authSource=admin");
        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error"));
        db.once("open", function() {
            done();
        });
    });

    describe("Test question prompt page", function() {  
        var questionAuthorID = new mongoose.Types.ObjectId();
        var authorID = new mongoose.Types.ObjectId();
        var currentDate = new Date();
        var questionID = new mongoose.Types.ObjectId();
        var anotherAuthorID = new mongoose.Types.ObjectId();
        var anotherQuestionID = new mongoose.Types.ObjectId();           
        it("New question saved to test database", function(done) {
            var newReply = reply({
                text: "text",
                score: 1,
                author: authorID,
                username: "username",
                date :  currentDate,
                question: questionID,
                accepted: true,
                rejected: false
            });

            var anotherReply = reply({
                text: "text",
                score: 1,
                author: anotherAuthorID,
                username: "username",
                date :  currentDate,
                question: anotherQuestionID,
                accepted: true,
                rejected: false
            });

            var repliesSet = [newReply, anotherReply];
            
            var testNewQuestion = testQuestions({
                _id: questionAuthorID,
                title: "title",
                text: "this is a text",
                score: 1,
                author: authorID,
                username: "username",
                date: currentDate,
                replies: repliesSet
            });
        
            testNewQuestion.save(done);
        }); 

        it("Should retrieve the question from database", function(done) {
            testQuestions.findById(questionAuthorID)
                .exec()
                .then(function(doc){
                //Assert that we found the correct user
                    testQuestions.findById(questionAuthorID)
                        .exec()
                        .then(function(doc1) {         
                            var foundId = doc1._id.toString();
                            var searchId = questionAuthorID.toString();
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
        mongoose.connection.db.dropCollection("testquestions1",function(){
            mongoose.connection.close(done);
        });
    });
});