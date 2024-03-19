import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "../BaseController";
import MessageToast from "sap/m/MessageToast";
import MessageBox from "sap/m/MessageBox";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";

/**
 * @namespace com.sap.controller.post
 */
export default class PostWrite extends BaseController {
	ViewModel : JSONModel;
	public onInit(): void {
		// apply content density mode to root view
		const oView = this.getView();
		const oModel = new JSONModel({
			title : "",
			content : "",
			mode : "C"
		});

		oView.setModel(oModel,"ViewModel");
		this.ViewModel = oView.getModel("ViewModel") as JSONModel;

		this.getRouter().getRoute("write").attachPatternMatched(this.onRouteMatched,this)
	}

	public async onRouteMatched(oEvent : Route$MatchedEvent){
		const {post_id} = oEvent.getParameter("arguments") as {post_id : string};
		
		if(!post_id){
			this.ViewModel.setProperty("/",{
				title : "",
				content : ""
			});
			return;
		}

		const {post} = await (await fetch(`http://localhost:3000/posts/${post_id}`)).json();
		this.ViewModel.setProperty("/", post);
	}

	public async onPost(){
		const oView = this.getView();
		const iframe = oView.byId("textEditor").getDomRef().querySelector(".tox-edit-area__iframe") as HTMLIFrameElement;
		const content = iframe.contentWindow.document.querySelector("#tinymce");
		const title = this.ViewModel.getProperty("/title");
		
		if(!content.innerHTML || !title){
			return MessageBox.alert("제목과 본문은 필수 입력해야합니다.");
		}

		const images = Array.from(content.querySelectorAll("img"));
		
		await Promise.all(images.map(async image=>{
			const url = image.src;

			//이미지 블랍객체로 변환
			const blob = await (await fetch(url)).blob();

			const fileName = url.split("/").pop();
			const fileType = blob.type.split("/").at(-1);

			const file = new File([blob], `${fileName}.${fileType}`);
			
			const formData = new FormData();
			formData.append('file', file);
			
			const {path} = await (await fetch("http://localhost:3000/posts/upload",{
				method : "POST",
				body : formData,				
			})).json();
			
			image.src = `http://localhost:3000/${path}`;
		}));


		const response = await this.fetchAPI("http://localhost:3000/posts", {
			method: "POST",
			body: JSON.stringify({
				title : title,
				content : content.innerHTML,
				// mode : this.ViewModel.getProperty("/mode"),
				// postId : this.ViewModel.getProperty("/post_id") 
			})
		});
		
		if(!response.ok){
			const {message} = await response.json();
			MessageToast.show(message);
			return;
		}

		this.navTo("read",{
			post_id : this.ViewModel.getProperty("/post_id") 
		});
	}
	
	public onBack(){
		this.onNavBack();
	}
}
