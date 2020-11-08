const express = require('express');
const mysql = require('mysql');

const router = express.Router();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});
const getConnection = () => {
    return pool;
};

router.get('/', (req, res, next) => {
    const connection = getConnection();

    connection.query("SELECT * FROM posts", (error,result) => {
        if(error){
            res.status(500).json({
                success: false,
                description: 'Server error, please try again'
            });
        }
        if(result.length === 0){
            res.status(401).json({
                success: false,
                description: 'No posts found'
            });
        }else{
            res.status(200).json({
                success: true,
                posts: result
            });
        }
    });
});

router.get('/:postId', (req, res, next) => {
    const connection = getConnection();

    connection.query("SELECT * FROM posts WHERE post_id = ?", [
        req.params.postId
    ], (error,result) => {
        if(error){
            res.status(500).json({
                success: false,
                description: 'Server error, please try again'
            });
        }
        if(result.length === 0){
            res.status(401).json({
                success: false,
                description: 'Post not found'
            });
        }else{
            res.status(200).json({
                success: true,
                posts: result[0]
            });
        }
    });
});

router.get('/author/:postAuthor', (req, res, next) => {
    const connection = getConnection();

    connection.query("SELECT * FROM posts WHERE post_author = ?", [
        req.params.postAuthor
    ], (error,result) => {
        if(error){
            res.status(500).json({
                success: false,
                description: 'Server error, please try again'
            });
        }
        if(result.length === 0){
            res.status(401).json({
                success: false,
                description: 'No posts found'
            });
        }else{
            res.status(200).json({
                success: true,
                posts: result
            });
        }
    });
});

module.exports = router;