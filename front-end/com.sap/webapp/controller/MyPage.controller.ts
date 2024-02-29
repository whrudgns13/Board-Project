import MessageToast from "sap/m/MessageToast";
import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace com.sap.controller
 */
export default class MyPage extends BaseController {
  ComponentModel : JSONModel;

	public onInit() {
		this.getRouter().getRoute("mypage").attachPatternMatched(this.onRouteMatched,this);
  }

  public async onRouteMatched(){
    this.ComponentModel = this.getOwnerComponent().getModel("ComponentModel") as JSONModel;
    try {
      const res = await fetch("/mypage",{
        headers : {
          "authorization" : this.ComponentModel.getProperty("/accessToken")
        }
      });
      
      if(!res.ok){
        const {message} = await res.json();
        MessageToast.show(message);
        this.onNavBack();
        return;
      }
      const {accessToken, user} = await res.json();
      this.ComponentModel.setProperty("/user", user);
      
      if(accessToken){
        this.ComponentModel.setProperty("/accessToken",accessToken);
      }
    }catch(error){
      MessageToast.show(error);
    }
  }
}
