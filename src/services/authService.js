const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User, Role } = require("../models");

const registerUser = async (userData) => {
    const {
        name,
        email,
        password,
        roleId
    } = userData;

    const existingUser = await User.findOne({
        where: { email }
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(
        password,
        10
    );

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        roleId
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId
    };
};

const loginUser = async (loginData) => {
    const {
        email,
        password
    } = loginData;

   const user = await User.findOne({
    where: { email },
    include: Role
});

    if (!user) {
        throw new Error(
            "Invalid email or password"
        );
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        throw new Error(
            "Invalid email or password"
        );
    }

    const token = jwt.sign(
        {
            id: user.id,
            roleId: user.roleId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return {
        message: "Login successful",
        token,
       user: {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    role: user.Role?.name
}
    };
};

module.exports = {
    registerUser,
    loginUser
};