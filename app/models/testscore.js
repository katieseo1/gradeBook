// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var testScoreSchema = mongoose.Schema({
	description: String,
	date :Date,
	testNumber:Number,
	userId:String,
	score:Number,
});


testScoreSchema.methods.apiRepr = function() {
		return {
			id: this._id,
		description: this.description,
		testNumber:this.testNumber,
		date:this.date,
		score:this.score,
		userId:this.userId
		};
	}
	testScoreSchema.set('collection','testScores');

module.exports = mongoose.model('TestScore', testScoreSchema, 'testscores' );
