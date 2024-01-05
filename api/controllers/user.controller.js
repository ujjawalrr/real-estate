import User from "../models/User.model.js";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';
import nodemailer from 'nodemailer';

export const test = (req, res) => {
    res.json({
        "message": "Test Succeed!"
    });
}

export const updateUser = async (req, res, next) => {
    if (req.user.id !== req.params.id) return next(errorHandler(401, "You can only update your own account!"));

    try {
        if (req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                avatar: req.body.avatar,
            }
        }, { new: true })

        const { password, ...rest } = updatedUser._doc;

        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req, res, next) => {
    if (req.user.id !== req.params.id) return next(errorHandler(401, "You can only delete your own account!"));

    try {
        await User.findByIdAndDelete(req.params.id);
        res.clearCookie('access_token');
        res.status(200).json("User has been deleted!");
    } catch (error) {
        next(error);
    }
}

export const getUserListings = async (req, res, next) => {
    if (req.user.id !== req.params.id) return next(errorHandler(401, "You can only view your own listings!"));

    try {
        const listings = await Listing.find({ userRef: req.params.id });
        res.status(200).json(listings);
    } catch (error) {
        next(error);
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return next(errorHandler(404, 'User not found!'));

        const { password: pass, ...rest } = user._doc;

        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
}

export const contactUser = async (req, res, next) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'josaacounsellors@gmail.com',
                pass: process.env.MAIL
            }
        })
        const mailOptions = {
            from: 'josaacounsellors@gmail.com',
            to: req.body.to,
            subject: req.body.subject,
            html: `User ${req.body.from} wants to contact you for listing on our website. <br> <b>Message:</b> ${req.body.message}`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            res.status(200).json("Contacted successfully!");
        })
    } catch (error) {
        next(error);
    }
}