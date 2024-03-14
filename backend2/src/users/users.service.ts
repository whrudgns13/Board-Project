import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entity/Users.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { AuthenticationService } from 'src/jwt/Authentication.service';
import { Request, Response } from 'express';
import { FindUserDto } from './dto/find-user.dto';

@Injectable()
export class UsersService {
  
  constructor( 
    @InjectRepository(Users)
    private userRepositorty : Repository<Users>,
    private readonly mailerService: MailerService,
    private authService : AuthenticationService
  ){}
  
  //모든 유저
  findAll(){
    return this.userRepositorty.find();
  }

  //유저 찾기
  find({id, email, password} : FindUserDto){
    if(!id && !email) return null;
    const where : FindUserDto = {};
    
    if(id){
      where.id = id;
    }

    if(email){
      where.email = email;
    }

    if(password){
      where.password = password;
    }

    return this.userRepositorty.findOne({where});
  }
  
  //유저생성
  async create(req : Request, res: Response){
    const { id, password, name, email, number } = req.body;
    const token = this.authService.validationToken(req.headers["authorization"]);
   
    if (email !== token.email || number !== token.number) {
      return res.status(401).send({
        message: "유효한 이메일 또는 인증번호가 아닙니다.",
      });
    }
    
    const user = await this.find(req.body);
    
    if(user){
      return res.status(401).send({
        message: "중복된 아이디 또는 이메일이 존재합니다.",
      });
    }
    
    await this.userRepositorty.save({
      id,
      password,
      name,
      email
    })

    return res.sendStatus(200);
  }

  sendMail(email : string){
    const validNumber = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
    const token = this.authService.createEmailToken(email, validNumber);

    const mailOptions = {
      from: process.env.MAIL_ID, // 보내는 사람의 이메일 주소
      to: email, // 받는 사람의 이메일 주소
      subject: '이메일 인증', // 이메일 제목
      html: `<h1>인증 코드: ${validNumber}</h1>`, // 이메일 내용
    };
  
    this.mailerService.sendMail(mailOptions);

    return {token};
  }

  authenticate(req : Request, res: Response) {    
    try{
      return this.authService.authenticateToken(req, res);
    }catch(error){
      return res.send({message : error});
    }
  }
  
  async login(req : Request, res: Response) {
    const loginUser: FindUserDto = req.body;
    
    try{
      const user = await this.find(loginUser);

      if(!user){
        return res.status(401).send({
          message: "비밀번호 또는 아이디가 다릅니다.",
        });
      }
      
      const { accessToken, refreshToken } = this.authService.createUserToken(user);

      res.cookie("refreshToken", refreshToken,{ httpOnly : true});
      
      return res.send({ accessToken, user });
    }catch(error){
      return res.status(500).send({ message: "예기치 않은 오류가 발생했습니다." });
    }
    
  }
}
