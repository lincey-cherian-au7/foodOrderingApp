import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import StatusCode from "../utils/statusCode";

const successResponse =(res,StatusCode,message,token,data)=> res.status(StatusCode).json({
    message,
    token,
    data
});

const errorResponse = (res,StatusCode,error)=> res.status(StatusCode).json({error});

const returnErrorMessages =(errors,res,next)=>{
    if(errors){
        const{details}=errors;
        const errorMessages = details.map((error) => error.message.replace(/['"]/g, '')).join(', ');
    return errorResponse(res, statusCodes.badRequest, errorMessages);
  }
  return next();
};

const generataeToken = async(data)=>{
    const token= jwt.sign(
        data,
        process.env.JWT_SECRET_KEY,
        {
            expiresIn:'30d'
        }
    );
    return token;
}
const generateOTP = async()=>{
    const otp = Math.floor(100000+(Math.random()*900000))
    return otp;
}
const generateHashedPassword = async(password)=>{
    const hashedPassword = await bcrypt.hash(password,10);
    return hashedPassword;
}
export default{
    successResponse,
    errorResponse,
    returnErrorMessages,
    generataeToken,
    generateHashedPassword,
    generateOTP,
}

