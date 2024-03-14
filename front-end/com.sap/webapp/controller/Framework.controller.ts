import BaseController from "./BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import Dialog from "sap/m/Dialog";
import MessageToast from "sap/m/MessageToast";
import MessageBox from "sap/m/MessageBox";
import { NavigationListItem$SelectEvent } from "sap/tnt/NavigationListItem";

/**
 * @namespace com.sap.controller
 */
export default class Framework extends BaseController {
	joinDialog: Dialog;
	loginDialog: Dialog;
	ViewModel: JSONModel;
	ComponentModel: JSONModel;

	public async onInit() {
		const oView = this.getView();

		// oView.addStyleClass(this.getOwnerComponent().getContentDensityClass());

		const navigationList = await (
			await fetch("http://localhost:3000/NavigationList.json")
		).json();

		const user = {
			id: "",
			password: "",
		};

		const oModel = new JSONModel({
			join: { ...user, number: "", name: "", email: "" },
			user: { ...user },
			navigation: navigationList,
			token: "",
		});

		oView.setModel(oModel, "oViewModel");
		this.ViewModel = oView.getModel("oViewModel") as JSONModel;
		this.ComponentModel = this.getOwnerComponent().getModel(
			"ComponentModel"
		) as JSONModel;
	}
	public async sayHello() {
		const users = await (await fetch("/users")).json();
		console.log(users);
	}

	public async onNavigation(oEvent: NavigationListItem$SelectEvent) {
		const control = oEvent.getParameter("item");
		const key = control.getKey();
		this.navTo(key);
	}

	public async onValidSendMail() {
		const email = this.ViewModel.getProperty("/join/email");

		if (!this.emailValidation(email)) {
			MessageBox.warning("유효하지 않은 이메일입니다.");
			return;
		}

		const response = await fetch("http://localhost:3000/users/mail", {
				method: "POST",
				body: JSON.stringify({ email }),
				headers: {
					"Content-Type": "application/json",
				},
		})

		if(!response.ok){
			MessageBox.information("이메일을 보내는대 오류가 발생했습니다.");
			return
		}
		
		MessageBox.information("이메일을 보냈습니다.");
		
		const { token } = await response.json();

		console.log(token);

		this.ViewModel.setProperty("/token", token);
	}

	public emailValidation(email: string) {
		const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return emailReg.test(email);
	}

	public async onOpenJoin() {
		if (!this.joinDialog) {
			this.joinDialog = (await this.loadFragment({
				name: "com.sap.view.user.Join",
			})) as Dialog;

			this.getView().addDependent(this.joinDialog);
		}

		this.joinDialog.open();
	}

	public onDialogClose(dialogIdentity: string) {
		switch (dialogIdentity) {
			case "join":
				this.joinDialog.close();
				break;
			case "login":
				this.loginDialog.close();
				break;
		}
	}

	public async onJoin() {
		const join = this.ViewModel.getProperty("/join");
		const token = this.ViewModel.getProperty("/token");

		const isValid = (() => {
			for (const key in join) {
				if (!join[key]) return false;
			}
			return true;
		})();

		if (!isValid) {
			MessageBox.information("입력값을 모두 입력해주세요");
			return;
		}

		try {
			const response = await fetch("http://localhost:3000/users/join", {
				method: "POST",
				headers: {
					authorization: token,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(join),
			});

			if (!response.ok) {
				const { message } = await response.json();
				MessageBox.alert(message);
				return;
			}
		} catch (error) {
			MessageToast.show("회원가입에 문제가 발생했습니다.");
			// throw new Error(error.message);
		}

		MessageToast.show("회원가입을 완료했습니다.");
		this.onDialogClose("join");
		this.onOpenLogin();
	}

	public async onOpenLogin() {
		if (!this.loginDialog) {
			this.loginDialog = (await this.loadFragment({
				name: "com.sap.view.user.login",
			})) as Dialog;

			this.getView().addDependent(this.loginDialog);
		}

		this.loginDialog.open();
	}

	public async onLogin() {
		type login = {
			email?: string;
			id?: string;
			password: string;
		};

		const { id, password } = this.ViewModel.getProperty("/user");

		if(!id || !password){
			MessageBox.information("아이디와 비밀번호를 모두 입력해주세요.");
			return;	
		}

		const body: login = { password };

		if (this.emailValidation(id)) {
			body.email = id;
		} else {
			body.id = id;
		}

		const response = await fetch("http://localhost:3000/users/login", {
			method: "POST",
			body: JSON.stringify(body),
			credentials : "include",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const { message } = await response.json();
			MessageBox.alert(message);
			return;
		}

		const { accessToken, user } = await response.json();
		this.ComponentModel.setProperty("/accessToken", accessToken);
		this.ComponentModel.setProperty("/isLogin", true);
		this.ComponentModel.setProperty("/user", user);

		console.log("로그인 성공");
		MessageToast.show(`${user.name}님 환영합니다.`)
		this.onDialogClose("login");
	}

	public onLogout() {
		fetch("/logout");
		this.ComponentModel.setProperty("/isLogin", false);
		this.ComponentModel.setProperty("/accessToken", "");
		this.ComponentModel.setProperty("/user", {});
		this.navTo("main");
	}
}
