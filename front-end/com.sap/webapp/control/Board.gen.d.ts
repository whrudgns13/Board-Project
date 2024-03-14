import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";

declare module "./Board" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $BoardSettings extends $ControlSettings {
        title?: string | PropertyBindingInfo;
        email?: string | PropertyBindingInfo;
        content?: string | PropertyBindingInfo;
    }

    export default interface Board {

        // property: title
        getTitle(): string;
        setTitle(title: string): this;

        // property: email
        getEmail(): string;
        setEmail(email: string): this;

        // property: content
        getContent(): string;
        setContent(content: string): this;
    }
}
