const authService = require("../services/authService");
const { User } = require("../models");
const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);

        res.status(201).json({
            message: "User registered successfully",
            user
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);

        res.json(result);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};
const profile = async (req, res) => {

    const user = await User.findByPk(
        req.user.id,
        {
            attributes: {
                exclude: ["password"]
            }
        }
    );

    res.json(user);
};
module.exports = {
    register,
    login,
    profile
};