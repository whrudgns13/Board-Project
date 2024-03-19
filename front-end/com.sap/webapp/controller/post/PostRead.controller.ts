import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "../BaseController";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import { FeedInput$PostEvent } from "sap/m/FeedInput";
import MessageToast from "sap/m/MessageToast";
import Menu from "sap/m/Menu";
import Control from "sap/ui/core/Control";
import Event from "sap/ui/base/Event";
import { Menu$ItemSelectEvent } from "sap/ui/unified/Menu";
import MenuItem from "sap/m/MenuItem";
import MessageBox from "sap/m/MessageBox";

type Comment = {
	content : string,
	post_id : string,
	comment_id? : string
}

/**
 * @namespace com.sap.controller
 */
export default class PostRead extends BaseController {
	ViewModel : JSONModel;
	menuFlagment : Menu;

	public onInit(): void {
		const oView = this.getView();
		const oModel = new JSONModel({
			title : "",
			content : ""
		});
		
		oView.setModel(oModel,"ViewModel");
		this.ViewModel = oView.getModel("ViewModel") as JSONModel;

		this.getRouter().getRoute("read").attachPatternMatched(this.onRouteMatched,this);
	}

	public async onRouteMatched(oEvent : Route$PatternMatchedEvent){
		const {post_id} = oEvent.getParameter("arguments") as {post_id : string};
	
		await this.getPost(post_id);
	}

	public async getPost(post_id : string){
		const data = await (await fetch(`http://localhost:3000/posts/${post_id}`)).json();
		data.comments = data.comments.map((comment : any)=>{
			comment.mode = "R";
			return comment;
		})
		this.ViewModel.setProperty("/",data);
		
		//return data;
	}

	public onEdit(){
		this.navTo("write",{
			post_id : this.ViewModel.getProperty("/post/post_id")
		})
	}

	public async onComment(oEvent : FeedInput$PostEvent){
		const content = oEvent.getParameter("value");
		const post_id = this.ViewModel.getProperty("/post/post_id");
		const control = oEvent.getSource();

		const body : Comment = {
			content,
			post_id
		};

		if(control.getBinding("value")){
			const path = control.getBinding("value").getContext().getPath();
			body.comment_id = this.ViewModel.getProperty(path+"/comment_id");
		}

		const response = await this.fetchAPI("http://localhost:3000/posts/comment",{
			method : body.comment_id ? "PATCH" : "POST",
			body : JSON.stringify(body)
		});

		if(!response.ok){
			const {message} = await response.json();
			MessageToast.show(message);
			return;
		}

		await this.getPost(post_id);
	}

	public async onCommentDelete(){
		const path = this.ViewModel.getProperty("/path");
		const commentId = this.ViewModel.getProperty(path+"/comment_id");
		const postId = this.ViewModel.getProperty(path+"/post_id");
		const response = await this.fetchAPI("/comments", {
			method : "DELETE",
			body : JSON.stringify({
				commentId,
				postId
			})
		});

		if(!response.ok){
			const {message} = await response.json();
			MessageToast.show(message);
			return;
		}

		await this.getPost(postId);
	}

	public feedEdit(){

	}

	public async onMenuOpen(oEvent : Event){
		const oView = this.getView();
		const oControl = oEvent.getSource() as Control;
		if (!this.menuFlagment) {
			this.menuFlagment  = (await this.loadFragment({
				name: "com.sap.view.user.Menu",
			})) as Menu;

			oView.addDependent(this.menuFlagment);
		}
	
		const path = oControl.getParent().getParent().getBindingContext("ViewModel").getPath()
		this.ViewModel.setProperty("/path",path);
		this.menuFlagment.openBy(oControl,true);
	}

	public onMenuAction(oEvent : Menu$ItemSelectEvent){
		const text = (oEvent.getParameter("item") as unknown as MenuItem).getText();

		switch(text){
			case "Delete" :
				MessageBox.confirm("정말 삭제하시겠습니까?",{
					onClose : (action : string) =>{
						if(action==="OK") this.onCommentDelete();
					}
				});				
			break;
			case "Modify" :
				const path = this.ViewModel.getProperty("/path");
				this.ViewModel.setProperty(path+"/mode","M");	
			break;
		}
	
	}

	public onBack(){
		this.onNavBack();
	}

}
