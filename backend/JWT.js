const jwt = require("jsonwebtoken");

//토큰생성
const createEmailToken = (email, number) =>{
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
const validationToken = (token, callback) =>{
  return jwt.verify(token, process.env.TOKEN_SECURITY, callback);
};

const refreshAccessToken = (refreshToken) =>{
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