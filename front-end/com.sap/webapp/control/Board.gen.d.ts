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

        /**
         * Gets current value of property "title".
         *
         * Default value is: ""
         * @returns Value of property "title"
         */
        getTitle(): string;

        /**
         * Sets a new value for property "title".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [title=""] New value for property "title"
         * @returns Reference to "this" in order to allow method chaining
         */
        setTitle(title: string): this;

        // property: email

        /**
         * Gets current value of property "email".
         *
         * Default value is: ""
         * @returns Value of property "email"
         */
        getEmail(): string;

        /**
         * Sets a new value for property "email".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [email=""] New value for property "email"
         * @returns Reference to "this" in order to allow method chaining
         */
        setEmail(email: string): this;

        // property: content

        /**
         * Gets current value of property "content".
         *
         * Default value is: ""
         * @returns Value of property "content"
         */
        getContent(): string;

        /**
         * Sets a new value for property "content".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [content=""] New value for property "content"
         * @returns Reference to "this" in order to allow method chaining
         */
        setContent(content: string): this;
    }
}
