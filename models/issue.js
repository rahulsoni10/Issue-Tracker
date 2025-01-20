const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Severe'],
        required: true
    },
    type: {
        type: String,
        enum: ['new', 'resolved'],
        default: 'new'
    }
}, { timestamps: true });

module.exports = mongoose.model('Issue', issueSchema);