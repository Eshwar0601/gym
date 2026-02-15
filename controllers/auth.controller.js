const User = require('../models/user.model');
const jwt = require('jsonwebtoken');


exports.registerUser = async (req, res) => {
    try {
        const {email, password, userName} = req.body;

        if(checkIfValueIsEmpty(email)) {
            return res.status(400).json({
                message : 'Email id is required'
            })
        }
        if(checkIfValueIsEmpty(password)) {
            return res.status(400).json({
                message : 'password is required'
            })
        }
        if(checkIfValueIsEmpty(userName)) {
            return res.status(400).json({
                message : 'name is required'
            })
        }
        const isUserAlreadyExist = await User.findOne({email: email});
        if(isUserAlreadyExist) {
            return res.status(400).json({ message: "User already exists" })
        }

        const newUser = await User.create({
            userName: userName,
            email: email,
            password: password,
            createdDate: new Date()
        });
        return res.status(200).json({
            status : 'SUCCESS',
            message: 'User Registered Succesfully'
        });

    } catch(error) {
        return res.status(500).json({
            error: error.message
        });
    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;


        if(checkIfValueIsEmpty(email)) {
            return res.status(400).json({
                message : 'Email id is required'
            })
        }
        if(checkIfValueIsEmpty(password)) {
            return res.status(400).json({
                message : 'password is required'
            })
        }

        const user = await User.findOne({email : email});
        if(checkIfValueIsEmpty(user)) {
            return res.status(400).json({
                message : "User not registered"
            });
        } 

        if(!checkIfValueIsEmpty(user.password)) {
            if(user.password !== password) {
                res.status(400).json({
                    message : "Invalid Credentials."
                })
            }
            const token = jwt.sign(
                { id: user._id },
                'SAMPLE_SECRET',
                { expiresIn: '30m' }
            );
            const refreshToken = jwt.sign(
                { id: user._id },
                'SAMPLE_SECRET',
                { expiresIn: '60m' }
            )
            return res.status(200).json({
                token,
                refreshToken
            })
        }
        
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

exports.refreshToken = (req, res) => {
    try {
        const {refreshToken} = req.body;

        if(checkIfValueIsEmpty(refreshToken)) {
            return res.status(400).json({
                message : 'Refresh Token is required'
            })
        }
        const decoded = jwt.verify(
            refreshToken,
            'SAMPLE_SECRET'
        )
        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            'SAMPLE_SECRET',
            { expiresIn: '30m' }
        )

        const newRefreshToken = jwt.sign(
            { userId: decoded.userId },
            'SAMPLE_SECRET',
            { expiresIn: '60m' }
        )

        return res.status(200).json({
            token : newAccessToken,
            refreshToken : newRefreshToken
        }) 

    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}


const checkIfValueIsEmpty = (value) => (value === '' || value === null || value === undefined);
