// load the things we need
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var userSchema = mongoose.Schema({
	local: {
		firstname: String,
		lastname:String,
		email: String,
		password: String,
		usergroup: String,
		name: String,
		grades: [{
			testNumber: Number,
			testScore: Number
		}]
	}
});

userSchema.methods.apiRepr = function() {
		return {
			id: this._id,
			usergroup: this.local.usergroup,
			email: this.local.email,
			firstname: this.local.firstname,
			lastname: this.local.lastname,
			grades: this.local.grades
		};
	}
	// Generate Hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
// Check password
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.local.password);
};

// Create a model
module.exports = mongoose.model('User', userSchema, 'users');
