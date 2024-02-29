import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import type { MetadataOptions } from "sap/ui/core/Element";
import jQuery from "sap/ui/thirdparty/jquery";
import Title from "sap/m/Title";
import HTML from "sap/ui/core/HTML";
import Text from "sap/m/Text";
import VBox from "sap/m/VBox";

/**
 * @namespace com.sap.control
 */
export default class Board extends Control {
	static readonly metadata: MetadataOptions = {
		properties: {
			title: { type: "string", defaultValue: "" },
			email: { type: "string", defaultValue: "" },
			content: { type: "string", defaultValue: "" },
		}
	};
	renderer = {
		apiVersion: 2,
		render: (oRm: RenderManager, control: Board) => {
			const title = new Title({
				text : control.getTitle(),
				titleStyle : "H3"
			});

			const email = new Text({text : control.getEmail()})
			const content = new HTML({
				content : `<acticle>${control.getContent()}</acticle>`
			});

			const div = new VBox({
				items : [
					new VBox({
						items : [ title, email ]
					}),
					content
				]
			}).addStyleClass("board sapUiSmallMargin flexGapS");

			oRm.openStart("div", control);
			oRm.openEnd();
			oRm.renderControl(div);
			oRm.close("div");
		},
	};

	init(){}

	onAfterRendering(oEvent: jQuery.Event): void {
		// const _self = this;
	
	}
}
