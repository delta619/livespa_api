const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const paymentSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please tell us your name!']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
      type: String,
      default: 'default.jpg'
    },
    role: {
      type: String,
      enum: ['payment', 'guide', 'lead-guide', 'admin'],
      default: 'payment'
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function(el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!'
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }

  });
  
paymentSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
  
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
  
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
  });
  
  paymentSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
  paymentSchema.pre( /^find/ , function(next){
    //  this points to current query
    this.find({active:{$ne:false}})
    next();
  })

paymentSchema.methods.correctPassword = async function(candidatePassword , paymentPassword){
        return await bcrypt.compare(candidatePassword , paymentPassword); 
}
paymentSchema.methods.createPasswordResetToken = async function(){
    
    const resetToken = await crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = await crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10*60*1000;
    
    return resetToken;
}
paymentSchema.methods.changedPasswordAfter = async function(JWTToken){
    
    if(this.changedPasswordAt){
        return this.changedPasswordAt.getTime()/1000 > JWTToken    // TRUE if password changed after generating token
    }else{
        return false;
    }
}

const payment = mongoose.model('Payments',paymentSchema)

module.exports = payment; 
