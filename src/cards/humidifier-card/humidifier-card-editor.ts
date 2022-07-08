import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { fireEvent, LovelaceCardEditor } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { APPEARANCE_FORM_SCHEMA } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import { HUMIDIFIER_CARD_EDITOR_NAME, HUMIDIFIER_ENTITY_DOMAINS } from "./const";
import { HumidifierCardConfig, humidifierCardConfigStruct } from "./humidifier-card-config";

const HUMIDIFIER_FIELDS = ["show_target_humidity_control"];

const computeSchema = memoizeOne((icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: HUMIDIFIER_ENTITY_DOMAINS } } },
    { name: "name", selector: { text: {} } },
    { name: "icon", selector: { icon: { placeholder: icon } } },
    ...APPEARANCE_FORM_SCHEMA,
    {
        type: "grid",
        name: "",
        schema: [
            { name: "show_target_humidity_control", selector: { boolean: {} } },
            { name: "collapsible_controls", selector: { boolean: {} } },
        ],
    },
    ...computeActionsFormSchema(),
]);

@customElement(HUMIDIFIER_CARD_EDITOR_NAME)
export class HumidifierCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: HumidifierCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: HumidifierCardConfig): void {
        assert(config, humidifierCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (HUMIDIFIER_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.humidifier.${schema.name}`);
        }
        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const entityState = this._config.entity ? this.hass.states[this._config.entity] : undefined;
        const entityIcon = entityState ? stateIcon(entityState) : undefined;
        const icon = this._config.icon || entityIcon;
        const schema = computeSchema(icon);

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${schema}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }
}
