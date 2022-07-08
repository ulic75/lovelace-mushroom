import { assign, boolean, number, object, optional } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import {
    AppearanceSharedConfig,
    appearanceSharedConfigStruct,
} from "../../shared/config/appearance-config";
import { EntitySharedConfig, entitySharedConfigStruct } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export type ThermostatCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig & {
        enable_when_off?: boolean;
        use_action_color?: boolean;
        use_action_icon?: boolean;
        show_mode_control?: boolean;
        show_temp_control?: boolean;
        show_temp_indicators?: boolean;
        temperature_gap?: number;
    };

export const thermostatCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({
        enable_when_off: optional(boolean()),
        use_action_color: optional(boolean()),
        use_action_icon: optional(boolean()),
        show_mode_control: optional(boolean()),
        show_temp_control: optional(boolean()),
        show_temp_indicators: optional(boolean()),
        temperature_gap: optional(number()),
    })
);
