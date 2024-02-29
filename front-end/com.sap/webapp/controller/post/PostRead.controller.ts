import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "../BaseController";
import { ListItemBase$PressEvent } from "sap/m/ListItemBase";
import ColumnListItem from "sap/m/ColumnListItem";
import { Route$PatternMatchedEvent } from "sap/ui/core/routing/Route";
import { FeedInput$PostEvent } from "sap/m/FeedInput";
import MessageToast from "sap/m/MessageToast";

/**
 * @namespace com.sap.controller
 */
export default class PostRead extends BaseController {
	ViewModel : JSONModel;

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
	
		const data = await (await fetch(`/posts/${post_id}`)).json();
		this.ViewModel.setProperty("/",{ ...data});
	}

	public onEdit(){
		this.navTo("write",{
			post_id : this.ViewModel.getProperty("/post/post_id")
		})
	}

	public async onComment(oEvent : FeedInput$PostEvent){
		const comment = oEvent.getParameter("value");

		const response = await this.fetchAPI("/comments",{
			method : "POST",
			body : JSON.stringify({
				comment,
				postId : this.ViewModel.getProperty("/post/post_id")
			})
		});

		if(!response.ok){
			const {message} = await response.json();
			MessageToast.show(message);
			return;
		}
	}

	public onBack(){
		this.onNavBack();
	}

}
