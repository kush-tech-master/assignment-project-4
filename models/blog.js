const mongoose = require('mongoose');
const data = require('../data.js');

const blogSchema = new mongoose.Schema({
   title: {
        type: String,
        required : true
    },
    description: {
        type: String,
        required : true
    },
    category: {
        type: String,
        required : true
    }, 
    imgUrl: {
       type: String,
       required : true
   },
     publishDate: {
        type: Date,
        required : true
    }, 
   

} ,{timestamps: true});

const BlogModel = new mongoose.model("BlogModel", blogSchema);

module.exports = BlogModel;
