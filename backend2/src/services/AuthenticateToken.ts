// import {validationToken} from "./JWT";

// const authenticateToken = (req : Request, res : Response) => {
//   try {
//     const accessToken = req.headers["authorization"];
//     if (!accessToken) throw new Error();

//     const token = validationToken(accessToken);

//     return { token };
//   } catch (error) {
//     try {
//       const refreshToken = req.cookies.refreshToken;

//       if (!refreshToken) {
//         throw new Error();
//       }
//       const newToken = jwt.refreshAccessToken(refreshToken);
//       const token = jwt.validationToken(newToken.accessToken);

//       res.cookie("refreshToken", newToken.refreshToken, { httpOnly: true });

//       return { token, accessToken: newToken.accessToken };
//     } catch (error) {
//       throw "로그인 먼저 진행해주세요";
//     }
//   }
// };