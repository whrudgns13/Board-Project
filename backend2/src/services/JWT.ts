import jwt, {VerifyCallback} from "jsonwebtoken";

//토큰생성
const createEmailToken = (email : string, number : string) =>{
  return jwt.sign({
    email,
    number
  },
  process.env.TOKEN_SECURITY,
  {
    expiresIn:"5m"
  }); 
};

const createUserToken = ({name, email}) =>{
  const accessToken = jwt.sign({
    email
  },
  process.env.TOKEN_SECURITY,
  {
    expiresIn:"3h"
  });

  const refreshToken = jwt.sign({name,email},process.env.TOKEN_SECURITY);
  return {accessToken, refreshToken};
};


//유효하면 토큰 반환
const validationToken : any = (token : string, callback? : VerifyCallback) =>{
  return jwt.verify(token, process.env.TOKEN_SECURITY, callback);
};

const refreshAccessToken = (refreshToken : string) =>{
  try{
    const token = validationToken(refreshToken);
    return createUserToken(token);
  }catch(error){
    throw new Error('Invalid refresh token');
  } 

}

module.exports = {
  createEmailToken,
  validationToken,
  createUserToken,
  refreshAccessToken
}