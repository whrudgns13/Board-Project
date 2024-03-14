import mailer from "nodemailer";

const transporter = mailer.createTransport({
  service: 'Gmail',
  auth: {
      user: process.env.MAIL_ID, // 보내는 사람의 이메일 주소
      pass: process.env.MAIL_PASSWORD // 이메일 주소의 비밀번호
  }
});

const sendEmail = (email : string, number : string) =>{
  const mailOptions = {
    from: process.env.MAIL_ID, // 보내는 사람의 이메일 주소
    to: email, // 받는 사람의 이메일 주소
    subject: '이메일 인증', // 이메일 제목
    text: `인증 코드: ${number}` // 이메일 내용
  };

  transporter.sendMail(mailOptions, (error, info)=>{
    if (error) {
      console.log('이메일 전송 실패:', error);
    } else {
      console.log('이메일 전송 성공:', info.response);
    }
  });
}

module.exports = {
  sendEmail
}

