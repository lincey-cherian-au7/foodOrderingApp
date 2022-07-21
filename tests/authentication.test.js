import chai ,{expect} from 'chai';
import chaiHttp from 'chaiHttp';
import server from '../src/server';
import StatusCode  from '../src/utils/statusCode';
import messages from '../src/utils/messages';

const{
    badRequest,
    conflict,
    created,
    success,
    forbidden
}= StatusCode;

const {
    emptyFirstName,
    emptyLastName,
    emptyPhone,
    emptyAddress,
    emptyPassword,
    invalidPhone,
    signupConflict,
    signupSuccessful,
    emptyOTP,
} = messages


const baseUrl = '/api/auth';

chai.use(chaiHttp);
chai.should();

let userToken = null;
let userOTP = null

describe('SIGN UP',()=>{
    it('Empty request should return 400',(done)=>{
        chai
            .request(server)
            .post(`${baseUrl}signup`)
            .end((err,res)=>{
                if(err) done(err);
                const{error}= res.body;
                except(res.status).to.equal(badRequest);
                expect(error);
                expect(error).to.equal(`${emptyFirstName}, ${emptyLastName} ${emptyAddress} ${emptyPhone} ${emptyPhone} ${emptyPassword}`)
                done();

            });
        });
        it('Invalid phone number should return 400',(done)=>{
            chai
                .request(server)
                .post(`${baseUrl}signup`)
                .end((err,res)=>{
                    if(err) done(err);
                    const {error} = res.body;
                    expect(res.status).to.equal(badRequest);
                    expect(error);
                    expect((error).to.equal(`${emptyFirstName} ,${emptyLastName} ,${emptyAddress},
                    ${emptyPhone} ,${emptyPassword}`));
                    done();
                })
        })
        it('Unknown property should return 400',(done)=>{
            chai
                .request(server)
                .post(`${baseUrl}signup`)
                .send({
                    firstName :'Lincey',
                    lastName:'Cherian',
                    phoneNumber :'+915278899632',
                    address :'No.26 LoveDale Apartment Sreekrishnapuram Banglore',
                    password:'admin@123',
                    email:'admin@domain.com'
                })
                .end((err,res)=>{
                    if(err) done(err);
                    const {error}= res.body;
                    expect(res.status).to.equal(badRequest);
                    expect(error);
                    expect(error).to.equal('email is not allowed');
                    done();
                })
        })
        it('valid signup should return 201',(done)=>{
            chai
                .request(server)
                .post(`${baseUrl}signup`)
                .send({
                    firstName :'James',
                    lastName:'Philip',
                    phoneNumber: process.env.TWILIO_CUSTOMER_NUMBER,
                    address:' TN-22 sT. 123 US',
                    password:'KT@123sdf'
                })
                .end((err,res)=>{
                    if(err) done(err);
                    const{message,token,data}= res.body;
                    expect(res.status).to.equal(created);
                    expect(message);
                    expect(message).to.equal(signupSuccessful);
                    expect(token).to.be.a('string');
                    expect(data);
                    expect(data).to.be.a('object');
                    expect(data).to.haveOwnProperty('firstName');
                    expect(data).to.haveOwnProperty('phoneNumber');
                    expect(data).to.haveOwnProperty('status');
                    expect(data.status).to.be.a('boolean');
                    expect(data.status).to.equal('false');
                    userToken = token;
                    done();

                })
        })
        it('Signup with existing phone number should return 409',(done)=>{
            chai
                .request(server)
                .post(`${baseUrl}signup`)
                .send({
                    firstName :'James',
                    lastName:'Philip',
                    phoneNumber: process.env.TWILIO_CUSTOMER_NUMBER,
                    address:' TN-22 sT. 123 US',
                    password:'KT@123sdf'
                })
                .end((err,res)=>{
                    if(err) done(err);
                    const{error} = res.body;
                    except(res.status).to.equal(conflict);
                    expect(error);
                    expect(error).to.equal(signupConflict);
                    done();
                })
        })
})

describe('VERIFY SIGNUP', () => {
    it('Empty request should return 400', (done) => {
      chai
        .request(server)
        .post(`${baseUrl}verify`)
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          if (err) done(err);
          const { error } = res.body;
          expect(res.status).to.equal(badRequest);
          expect(error);
          expect(error).to.equal(emptyOTP);
          done();
        });
    });
    it('Invalid OTP should return 400', (done) => {
      chai
        .request(server)
        .post(`${baseUrl}verify`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          otp: 'Ethan',
        })
        .end((err, res) => {
          if (err) done(err);
          const { error } = res.body;
          expect(res.status).to.equal(badRequest);
          expect(error);
          expect(error).to.equal(invalidOTP);
          done();
        });
    });
    it('Unknown property should return 400', (done) => {
      chai
        .request(server)
        .post(`${baseUrl}verify`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          otp: '123456',
          firstName: 'Ethan',
        })
        .end((err, res) => {
          if (err) done(err);
          const { error } = res.body;
          expect(res.status).to.equal(badRequest);
          expect(error);
          expect(error).to.equal('firstName is not allowed');
          done();
        });
    });
    it('Wrong OTP should return 400', (done) => {
      chai
        .request(server)
        .post(`${baseUrl}verify`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          otp: '123456',
        })
        .end((err, res) => {
          if (err) done(err);
          const { error } = res.body;
          expect(res.status).to.equal(forbidden);
          expect(error);
          expect(error).to.equal(wrongOTP);
          done();
        });
    });
    it('Valid OTP but absent token should return 400', (done) => {
      chai
        .request(server)
        .post(`${baseUrl}verify`)
        .send({
          otp: userOTP,
        })
        .end((err, res) => {
          if (err) done(err);
          const { error } = res.body;
          expect(res.status).to.equal(badRequest);
          expect(error);
          expect(error).to.equal(invalidRequest);
          done();
        });
    });
    it('Valid OTP should return 200', (done) => {
      chai
        .request(server)
        .post(`${baseUrl}verify`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          otp: userOTP,
        })
        .end((err, res) => {
          if (err) done(err);
          const { message, data } = res.body;
          expect(res.status).to.equal(success);
          expect(message);
          expect(message).to.equal(verifySuccessful);
          expect(data);
          expect(data).to.be.a('object');
          expect(data).to.haveOwnProperty('firstName');
          expect(data).to.haveOwnProperty('lastName');
          expect(data).to.haveOwnProperty('status');
          expect(data.status).to.be.a('boolean');
          expect(data.status).to.equal(true);
          done();
        });
    });
    it('Resend OTP should return 200', (done) => {
      chai
        .request(server)
        .get(`${baseUrl}verify/retry`)
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          if (err) done(err);
          const { message } = res.body;
          expect(res.status).to.equal(success);
          expect(message);
          expect(message).to.equal(resendOTPSuccessful);
          done();
        });
    });
  });