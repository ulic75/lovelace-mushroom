import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { isActive } from "../../ha/data/entity";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
    UNIT_F,
} from "../../ha";
import { ClimateEntity, CLIMATE_PRESET_NONE } from "../../ha/data/climate";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card-ss";
import { coerceBoolean } from "../../utils/boolean";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { climateIconAction } from "../../utils/icons/climate-icon";
import { stateIcon } from "../../utils/icons/state-icon";
import { computeEntityPicture } from "../../utils/info";
import { ThermostatCardConfig } from "./thermostat-card-config";
import {
    THERMOSTAT_CARD_EDITOR_NAME,
    THERMOSTAT_CARD_NAME,
    THERMOSTAT_ENTITY_DOMAINS,
} from "./const";
import { formatDegrees, getStepSize } from "./utils";
import "./controls/thermostat-mode-control";
import "./controls/thermostat-temperature-control";

type ThermostatCardControl = "temperature_control" | "mode_control";

const CONTROLS_ICONS: Record<ThermostatCardControl, string> = {
    mode_control: "mdi:thermostat",
    temperature_control: "mdi:thermometer",
};

registerCustomCard({
    type: THERMOSTAT_CARD_NAME,
    name: "Shroom Singles Thermostat Card",
    description: "Shroom Singles card for climate entities",
});

@customElement(THERMOSTAT_CARD_NAME)
export class ThermostatCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./thermostat-card-editor");
        return document.createElement(THERMOSTAT_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<ThermostatCardConfig> {
        const entities = Object.keys(hass.states);
        const panels = entities.filter((e) => THERMOSTAT_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${THERMOSTAT_CARD_NAME}`,
            entity: panels[0],
            temperature_gap: hass.config.unit_system.temperature === UNIT_F ? 2 : 1,
        };
    }

    @state() private _config?: ThermostatCardConfig;

    @state() private _activeControl?: ThermostatCardControl;

    @state() private _controls: ThermostatCardControl[] = [];

    _onControlTap(ctrl, e): void {
        e.stopPropagation();
        this._activeControl = ctrl;
    }

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: ThermostatCardConfig): void {
        this._config = {
            tap_action: {
                action: "more-info",
            },
            hold_action: {
                action: "more-info",
            },
            double_tap_action: {
                action: "more-info",
            },
            ...config,
        };
        this.updateControls();
    }

    updateControls() {
        if (!this._config || !this.hass || !this._config.entity) return;

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        if (!entity) return;

        const controls: ThermostatCardControl[] = [];
        if (this._config.show_temp_control) {
            controls.push("temperature_control");
        }
        if (this._config.show_mode_control) {
            controls.push("mode_control");
        }
        this._controls = controls;
        const isActiveControlSupported = this._activeControl
            ? controls.includes(this._activeControl)
            : false;
        this._activeControl = isActiveControlSupported ? this._activeControl : controls[0];
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (this.hass && changedProperties.has("hass")) {
            this.updateControls();
        }
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id] as ClimateEntity;

        const { current_temperature: currentTemp, hvac_action, preset_mode } = entity.attributes;

        const name = this._config.name || entity.attributes.friendly_name || "";

        const appearance = computeAppearance(this._config);
        const picture = computeEntityPicture(entity, appearance.icon_type);

        let icon = this._config.icon || "mdi:thermostat";
        if (coerceBoolean(this._config.use_action_icon)) {
            if (hvac_action && hvac_action !== "idle") {
                icon = climateIconAction(hvac_action);
            } else {
                icon = stateIcon(entity);
            }
        }

        const step = getStepSize(this.hass, entity);

        const formattedCurrentTemp = formatDegrees(this.hass, currentTemp, step);
        const currentTempDisplay = `${formattedCurrentTemp} ${this.hass.config.unit_system.temperature}`;
        const localizedClimateState = this.hass!.localize(
            `component.climate.state._.${entity.state}`
        );
        const localizedPresetMode =
            preset_mode && preset_mode !== CLIMATE_PRESET_NONE
                ? this.hass!.localize(`state_attributes.climate.preset_mode.${preset_mode}`) ||
                  preset_mode
                : "";
        const localizedHvacAction = hvac_action
            ? this.hass!.localize(`state_attributes.climate.hvac_action.${hvac_action}`)
            : null;

        const state = `${currentTempDisplay} |${
            localizedHvacAction ? ` ${localizedHvacAction} -` : ""
        }${` ${localizedClimateState}`}${
            Boolean(localizedPresetMode) ? ` - ${localizedPresetMode}` : ""
        }
        `;

        const rtl = computeRTL(this.hass);

        return html`
            <ha-card class=${classMap({ "fill-container": appearance.fill_container })}>
                <mushroom-card .appearance="${appearance}" ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .appearance=${appearance}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        ${picture ? this.renderPicture(picture) : this.renderIcon(entity, icon)}
                        ${this.renderBadge(entity)}
                        ${this.renderStateInfo(entity, appearance, name, state)};
                    </mushroom-state-item>
                    ${this._controls.length > 0
                        ? html`
                              <div class="actions" ?rtl=${rtl}>
                                  ${this.renderActiveControl(entity)} ${this.renderOtherControls()}
                              </div>
                          `
                        : null}
                </mushroom-card>
            </ha-card>
        `;
    }

    protected renderIcon(entity: ClimateEntity, icon: string): TemplateResult {
        const { hvac_action } = entity.attributes;
        const active = isActive(entity);
        const iconStyle = {};
        if (this._config?.use_action_color) {
            if (hvac_action && !["idle", "off"].includes(hvac_action)) {
                iconStyle["--icon-color"] = `rgb(var(--rgb-action-climate-${hvac_action}))`;
                iconStyle["--shape-color"] = `rgba(var(--rgb-action-climate-${hvac_action}), 0.25)`;
            } else if (!hvac_action && entity.state !== "off") {
                iconStyle["--icon-color"] = `rgb(var(--rgb-state-climate-${entity.state}))`;
                iconStyle["--shape-color"] = `rgba(var(--rgb-state-climate-${entity.state}), 0.25)`;
            }
        }
        return html`
            <mushroom-shape-icon
                slot="icon"
                .disabled=${!active}
                .icon=${icon}
                style=${styleMap(iconStyle)}
            ></mushroom-shape-icon>
        `;
    }

    private renderOtherControls(): TemplateResult | null {
        const otherControls = this._controls.filter((control) => control != this._activeControl);

        return html`
            ${otherControls.map(
                (ctrl) => html`
                    <mushroom-button
                        .icon=${CONTROLS_ICONS[ctrl]}
                        @click=${(e) => this._onControlTap(ctrl, e)}
                    ></mushroom-button>
                `
            )}
        `;
    }

    private renderActiveControl(entity: ClimateEntity): TemplateResult | null {
        const appearance = computeAppearance(this._config!);
        const rtl = computeRTL(this.hass);

        switch (this._activeControl) {
            case "mode_control":
                return html` <ss-thermostat-mode-control
                    .hass=${this.hass}
                    .entity=${entity}
                    .fill=${appearance.layout !== "horizontal"}
                ></ss-thermostat-mode-control>`;
            case "temperature_control":
                return html`<ss-thermostat-temperature-control
                    ?rtl=${rtl}
                    .hass=${this.hass}
                    .entity=${entity}
                    .gap=${this._config?.temperature_gap ?? 0}
                    .showIndicators=${!!this._config!.show_temp_indicators}
                    .enableWhenOff=${this._config?.enable_when_off}
                ></ss-thermostat-temperature-control>`;
            default:
                return null;
        }
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon {
                    --icon-color: var(--icon-color-disabled);
                    --shape-color: var(--shape-color-disabled);
                }
            `,
        ];
    }
}
