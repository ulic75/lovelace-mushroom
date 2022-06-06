import { assign, boolean, object, optional } from "superstruct";
import { actionsSharedConfigStruct, ActionsSharedConfig } from "../../shared/config/actions-config";
import { layoutSharedConfigStruct, LayoutSharedConfig } from "../../shared/config/layout-config";
import { entitySharedConfigStruct, EntitySharedConfig } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { LovelaceCardConfig } from "../../ha";

export type FanCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    LayoutSharedConfig &
    ActionsSharedConfig & {
        hide_state?: boolean;
        icon_animation?: boolean;
        show_percentage_control?: boolean;
        show_oscillate_control?: boolean;
        collapsible_controls?: boolean;
    };

export const fanCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, layoutSharedConfigStruct, actionsSharedConfigStruct),
    object({
        hide_state: optional(boolean()),
        icon_animation: optional(boolean()),
        show_percentage_control: optional(boolean()),
        show_oscillate_control: optional(boolean()),
        collapsible_controls: optional(boolean()),
    })
);
