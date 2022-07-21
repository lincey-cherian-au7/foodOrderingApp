import jwt from 'jsonwebtoken';
import authentication from '../validations/authentication';
import helpers from '../helpers/misc';
import models from '../database/models';
import services from '../services/services';
import StatusCode from '../utils/statusCode';
import messages from '../utils/messages';

const {signup,verifyOTP} = authentication;
const {returnErrorMessages} = helpers;
const {User} =models;
const {findByCondition} = services;
const {conflict,forbidden} = StatusCode;
const {signupConflict,wrongOTP} = messages;

const validateSignup = async(req,res,next)=>{
    const {error}= signup(req.body);
    returnErrorMessages(console.log(error,res,next));
}

const isUserRegistered = async(req,res,next)=>{
    const {phoneNumber} =req.body;
    const condition ={phoneNumber};
    const user = await findByCondition(User,condition);
    if(user)
        return errorResponse(res,conflict,signupConflict);
    return next();
}

const validateVerifyOTP = async(req,res,next)=>{
    const {} = verifyOTP(req.body);
    returnErrorMessages(error,res,next)
}


const checkUserToken = async(req,res,next)=>{
    let token = req.get('authorization');
    if(!token){
        return errorResponse(res,
            StatusCode.badRequest,
            messages.invalidRequest
        )
    }
    try{
        token = token.split(' ').pop();
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY);
        const {phoneNumber} = decodedToken;
        const condition ={phoneNumber}
        const userData = await findByCondition(User,condition);
        req.userData = userData.dataValues;
        return next();
    }catch(error){
        return errorResponse(res.forbidden,wrongOTP)
    }
    
}
const checkOTP = async(req,res,next)=>{
    const {otp} = req.body;
    const userOTP = req.userData.otp;
    if(otp !== userOTP){
        return errorResponse(res,forbidden,wrongOTP)
    } 
    return next();
}
export default{
    validateSignup,
    isUserRegistered,
    validateVerifyOTP,
    checkUserToken,
    checkOTP,
};