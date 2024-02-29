import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "../BaseController";
import { ListItemBase$PressEvent } from "sap/m/ListItemBase";
import ColumnListItem from "sap/m/ColumnListItem";

/**
 * @namespace com.sap.controller
 */
export default class Posts extends BaseController {
	ViewModel : JSONModel;

	public onInit(): void {
		this.getRouter().getRoute("posts").attachPatternMatched(this.onRouteMatched,this);
	}

	public onRouteMatched(){
		const oView = this.getView();
		const oModel = new JSONModel({
			posts : []
		});

		oView.setModel(oModel,"ViewModel");
		this.ViewModel = oView.getModel("ViewModel") as JSONModel;

		this.getPost();		
	}

	public async getPost(){
		const {data} = await (await fetch("/posts")).json();
		this.ViewModel.setProperty("/posts",data);
	}

	public onPostDetail(oEvent : ListItemBase$PressEvent){
		const control = oEvent.getSource() as ColumnListItem;
		const bindingPath = control.getBindingContext("ViewModel").getPath()
		const {post_id} = this.ViewModel.getProperty(bindingPath);

		this.navTo("read",{ post_id });
	}

	onNavWrite(){
		this.navTo("write");
	}

}
