import { fireEvent, LocalizeFunc, LovelaceCardEditor } from "custom-card-helpers";
import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import { MEDIA_PLAYER_CARD_EDITOR_NAME, MEDIA_PLAYER_ENTITY_DOMAINS } from "./const";
import {
    MediaPlayerCardConfig,
    mediaPlayerCardConfigStruct,
    MEDIA_LAYER_MEDIA_CONTROLS,
    MEDIA_PLAYER_VOLUME_CONTROLS,
} from "./media-player-card-config";

export const MEDIA_LABELS = [
    "use_media_info",
    "use_media_artwork",
    "show_volume_level",
    "media_controls",
    "volume_controls",
];

const computeSchema = memoizeOne((localize: LocalizeFunc, icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: MEDIA_PLAYER_ENTITY_DOMAINS } } },
    { name: "name", selector: { text: {} } },
    {
        type: "grid",
        name: "",
        schema: [{ name: "icon", selector: { icon: { placeholder: icon } } }],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "layout", selector: { "mush-layout": {} } },
            { name: "fill_container", selector: { boolean: {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "use_media_info", selector: { boolean: {} } },
            { name: "use_media_artwork", selector: { boolean: {} } },
            { name: "show_volume_level", selector: { boolean: {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            {
                name: "volume_controls",
                selector: {
                    select: {
                        options: MEDIA_PLAYER_VOLUME_CONTROLS.map((control) => ({
                            value: control,
                            label: localize(
                                `editor.card.media-player.volume_controls_list.${control}`
                            ),
                        })),
                        mode: "list",
                        multiple: true,
                    },
                },
            },
            {
                name: "media_controls",
                selector: {
                    select: {
                        options: MEDIA_LAYER_MEDIA_CONTROLS.map((control) => ({
                            value: control,
                            label: localize(
                                `editor.card.media-player.media_controls_list.${control}`
                            ),
                        })),
                        mode: "list",
                        multiple: true,
                    },
                },
            },
            { name: "collapsible_controls", selector: { boolean: {} } },
        ],
    },
    { name: "tap_action", selector: { "mush-action": {} } },
    { name: "hold_action", selector: { "mush-action": {} } },
    { name: "double_tap_action", selector: { "mush-action": {} } },
]);

@customElement(MEDIA_PLAYER_CARD_EDITOR_NAME)
export class MediaCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: MediaPlayerCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: MediaPlayerCardConfig): void {
        assert(config, mediaPlayerCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (MEDIA_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.media-player.${schema.name}`);
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

        const customLocalize = setupCustomlocalize(this.hass!);
        const schema = computeSchema(customLocalize, icon);

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
