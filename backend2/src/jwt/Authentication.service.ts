import { Injectable } from '@nestjs/common';
import {JwtService} from "@nestjs/jwt";
import { Request, Response } from 'express';

@Injectable()
export class AuthenticationService {
  constructor(private readonly jwtService: JwtService) {}
  
  createEmailToken(email : string, number : string){
    return this.jwtService.sign({
      email,
      number
    },
    {
      expiresIn:"5m"
    }); 
  }

  createUserToken(auth: { email: string; name: string; } ){
    const accessToken = this.jwtService.sign({
      email : auth.email,
    },
    {
      expiresIn:"3h"
    });
  
    const refreshToken = this.jwtService.sign({
      name : auth.name,
      email : auth.email
    });

    return {accessToken, refreshToken};
  };

  //토큰 반환
  validationToken(token : string){
    return this.jwtService.verify(token);
  };

  /**
   * 토큰이 유효하다면 토큰반환
   * 유효하지 않다면 refreshToken을 확인해 재발급
   * @param req 
   * @param res 
   * @returns object
   */
  authenticateToken(req : Request, res : Response){

    try {
      const accessToken = req.headers["authorization"];
      if (!accessToken) throw new Error();
  
      const token = this.validationToken(accessToken);
      return { token };
    } catch (error) {
      try {
        
        const refreshToken = req.cookies['refreshToken'];
        
        if (!refreshToken) {
          throw new Error();
        }
        const newToken = this.refreshAccessToken(refreshToken);
        const token = this.validationToken(newToken.accessToken);
  
        res.cookie("refreshToken", newToken.refreshToken, { httpOnly: true });
  
        return res.send({ token, accessToken: newToken.accessToken });
      } catch (error) {
        throw "토큰이 없습니다.";
      }
    }
  }

  refreshAccessToken(refreshToken : string){
    try{
      const token = this.validationToken(refreshToken);
      return this.createUserToken(token);
    }catch(error){
      throw new Error('Invalid refresh token');
    } 
  }
}
