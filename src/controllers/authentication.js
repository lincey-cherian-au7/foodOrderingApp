import _ from 'lodash';
import StatusCode from '../utils/statusCode';
import messages from '../utils/messages';
import misc from '../helpers/misc';
import services  from '../services/services';
import AsyncQueue from 'sequelize/types/dialects/mssql/async-queue';
const {
    created,
    serverError,
    success
} = StatusCode;

const{
    optMessage,
    signupSuccessful,
    verifySuccessful,
    resendOTPSuccessful
} = messages;

const {
    successResponse,
    errorResponse,
    generataeToken,
    generateHashedPassword,
    generateOTP,
} = misc;
const {saveData,updateByCondition} = services;
const {User} = models;

export default class Authentication{
    static signUp = async(req,res)=>{
        try{
            const {
                firstName, 
                lastName, 
                phoneNumber,
                address,
                password} = req.body;
            
            const hashedPassword = await generateHashedPassword(password);

            const otpCode = await generateOTP();

            const userObject ={
                firstName,
                lastName,
                phoneNumber,
                address,
                password:hashedPassword,
                otp:otpCode
            }
            const data = await saveData(User, userObject);
            
            if(process.env.NODE_ENV ==='production'){
                await sendOTP(phoneNumber, `${optMessage} ${otpCode}`)
            }

            const userData =_.omit(data,['id','password'])

            const tokenData =_.pick(userObject,'phoneNumber');
            const token = await generataeToken(tokenData);
            return successResponse(res,created,signupSuccessful,null,null)

        }catch(err){
            return errorResponse(res,serverError,err)
        }
    };
    static verify = async(req,res)=>{
        try{
            const{phoneNumber} = req.userData;
            const condition ={phoneNumber};
            const data = {status:true};
            const {dataValues} = await updateByCondition(User,data,condition);
            const updatedData = _.omit(dataValues,['id','password','otp'])
            return successResponse(res,success,verifySuccessful)
        }catch(error){
            return errorResponse(res,serverError,error);
        }
    }
    static resendOTP = async(req,res)=>{
        try{
            const{phoneNumber}= req.userData;
            const otpCode = await generatorOTP();

            if(process.env.NODE_ENV ==='production'){
                await sendOTP(phoneNumber, `${optMessage} ${otpCode}`)
            }
            return successResponse(res,success,resendOTPSuccessful)

        }catch(error){
            return errorResponse(res,serverError,error)
        }
    }
}