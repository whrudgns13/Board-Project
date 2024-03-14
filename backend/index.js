require("dotenv").config({ path: "./config/.env" });
const cookieParser = require("cookie-parser");
const express = require("express");

const {uploader, fileDuplicateCheck} = require("./fileUploader.js");


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const { callDatabase } = require("./config/database.js");

const jwt = require("./JWT.js");
const mail = require("./mail.js");

// path가 webapp으로 들어오면 ../front-end/com.sap/dist 이경로가 루트로 인식
// app.use(express.static("C:/nodejs-mysql/front-end/com.sap/dist"));
app.use("/", express.static(__dirname));
app.use("/webapp", express.static("C:/nodejs-mysql/front-end/com.sap/dist"));
app.use(express.json());

const getUser = async (email) => {
  const query = `SELECT * FROM USERS WHERE email = '${email}'`;
  const [user] = await callDatabase(query);
  return user;
};

const authenticateToken = (req, res) => {
  try {
    const accessToken = req.headers["authorization"];
    if (!accessToken) throw new Error();

    const token = jwt.validationToken(accessToken);

    return { token };
  } catch (error) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new Error();
      }
      const newToken = jwt.refreshAccessToken(refreshToken);
      const token = jwt.validationToken(newToken.accessToken);

      res.cookie("refreshToken", newToken.refreshToken, { httpOnly: true });

      return { token, accessToken: newToken.accessToken };
    } catch (error) {
      throw "로그인 먼저 진행해주세요";
    }
  }
};

app.get("/webapp", (req, res) => {
  console.log(__dirname);
  res.sendFile("/index.html");
});

app.post("/email", (req, res) => {
  const { email } = req.body;

  //랜덤번호생성
  const validNumber = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  const token = jwt.createEmailToken(email, validNumber);

  mail.sendEmail(email, validNumber);

  res.send({ token });
});

app.post("/join", async (req, res) => {
  const { id, password, name, email, number } = req.body;
  const token = jwt.validationToken(req.headers["authorization"]);

  if (email !== token.email || number !== token.number) {
    res.status(401).send({
      message: "유효한 이메일 또는 인증번호가 아닙니다.",
    });
  }

  try {
    const checkUserQuery = `SELECT * FROM USERS WHERE id = '${id}' OR email = '${email}';`;
    const userRows = await callDatabase(checkUserQuery);

    if (userRows.length) {
      return res.status(401).send({
        message: "중복된 아이디 또는 이메일이 존재합니다.",
      });
    }

    const insertQuery = `INSERT INTO USERS (id,password,email,name) VALUES ('${id}','${password}','${email}','${name}')`;
    const insertRows = await callDatabase(insertQuery);

    if (insertRows.length) {
      res.sendStatus(200);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "예기치 않은 오류가 발생했습니다." });
  }
});

app.post("/login", async (req, res) => {
  const body = req.body;

  const query = `SELECT * FROM USERS WHERE
    ${body.id ? "id" : "email"} = '${body.id ? body.id : body.email}' AND 
    password = '${body.password}'`;

  try {
    const [user] = await callDatabase(query);
    
    if (!user) {
      return res.status(401).send({
        message: "비밀번호 또는 아이디가 다릅니다.",
      });
    }

    const { accessToken, refreshToken } = jwt.createUserToken(user);
    res.cookie("refreshToken", refreshToken, { httpOnly: true });

    res.send({ accessToken, user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "예기치 않은 오류가 발생했습니다." });
  }
});

app.get("/mypage", async (req, res) => {
  try {
    const { token, accessToken } = authenticateToken(req, res);
    
    if (token) {
      const user = await getUser(token.email);
      return res.send({ user });
    }

    const { email } = jwt.validationToken(accessToken);
    const user = await getUser(email);

    res.send({ user, accessToken });
  } catch (error) {
    res.status(401).send({message : error});
  }
});

app.get("/authenticate",(req, res)=>{
  try{
    const {token, accessToken} = authenticateToken(req,res);
    res.send({token, accessToken});
  }catch(error){
    res.send({message : "토큰이 없습니다."})
  }
});

app.get("/logout",(req,res)=>{
  res.clearCookie("refreshToken");
  res.sendStatus(200);
});


app.post("/imgUpload", uploader.single("image"),(req,res)=>{  
  const uploadFile = req.file;
  fileDuplicateCheck(uploadFile, res); 
});

app.get("/posts", async (req, res) => {
  const query = "SELECT * FROM POSTS ORDER BY CREATED_AT DESC";
  const rows = await callDatabase(query);
  res.send({data : rows});
});

app.get("/posts/:id", async (req, res) => {
  const id = req.params.id;
  
  const postQuery = `SELECT * FROM POSTS WHERE post_id = '${id}'`;
  const postRows = await callDatabase(postQuery);

  const commentQuery = `SELECT * FROM COMMENTS WHERE post_id = '${id}'`;
  const commentRows = await callDatabase(commentQuery);

  if(postRows.length){
    return res.send({
      post : postRows[0],
      comments : commentRows
    });
  }
})

app.post("/post",async (req, res)=>{
  const {title, content, mode, postId} = req.body;

  try{    
    const { token } = authenticateToken(req, res); 
    let query;
    
    if(mode==='C'){
      query = `INSERT INTO POSTS (title, content, email) VALUES ('${title}','${content}','${token.email}')`;
    }

    if(mode==='M' && postId){
      query = `UPDATE POSTS SET title = '${title}', content = '${content}' WHERE post_id = ${postId}`;
    }

    await callDatabase(query);
    res.send({message : "완료"});
  }catch(error){
    console.log(error);
    res.status(400).send({message : error});
  }
  
});


app.post("/comments",async (req, res)=>{
  const {content, postId, mode, commentId} = req.body;
  console.log(content);
  try{
    const { token } = authenticateToken(req, res);
    let query = `INSERT INTO COMMENTS (email, post_id, content) VALUES ('${token.email}', '${postId}', '${content}')`;;

    if(mode ==="M" && commentId){
      query = `UPDATE COMMENTS SET content = '${content}' WHERE post_id = ${postId} AND comment_id = ${commentId}`;
    }

    await callDatabase(query);
    res.send({message : "완료"});
  }catch(error){
    console.log(error);
    res.status(400).send({message : error});
  }

});

app.delete("/comments",async (req, res)=>{
  const {commentId, postId} = req.body;
  
  try{
    const { token } = authenticateToken(req, res);
    const query = `DELETE FROM COMMENTS WHERE post_id = '${postId}' AND comment_id = '${commentId}'`;
    await callDatabase(query);
    res.send({message : "완료"});
  }catch(error){
    console.log(error);
    res.status(400).send({message : error});
  }

});

app.listen(3000, () => {
  console.log("Server Start");
});
