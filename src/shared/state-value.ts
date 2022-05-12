import { css, CSSResultGroup, html, LitElement, TemplateResult, unsafeCSS } from "lit";
import { property, customElement } from "lit/decorators.js";

@customElement("mushroom-state-value")
export class StateValue extends LitElement {
    @property() public value: string = "";

    protected render(): TemplateResult {
        return html`<div class="value">${this.value}</div>`;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --text-color: var(--primary-text-color);
                --bg-color: rgba(var(--rgb-primary-text-color), 0.05);
                font-size: var(--control-height);
                height: var(--control-height);
                width: calc(var(--control-height) * var(--control-button-ratio));
                flex: none;
            }
            .value {
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-color);
                font-size: 0.38em;
                font-weight: bold;
                height: 100%;
                width: 100%;
                border-radius: var(--control-border-radius);
                border: none;
                background-color: var(--bg-color);
                transition: background-color 280ms ease-in-out;
            }
        `;
    }
}
