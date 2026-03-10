let mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'username không được để trống'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'password không được để trống']
    },
    email: {
        type: String,
        required: [true, 'email không được để trống'],
        unique: true
    },
    fullName: {
        type: String,
        default: ''
    },
    avatarUrl: {
        type: String,
        default: 'https://i.sstatic.net/l60Hf.png'
    },
    status: {
        type: Boolean,
        default: false
    },
    role: {
        type: mongoose.Types.ObjectId,
        ref: 'Role'
    },
    loginCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
