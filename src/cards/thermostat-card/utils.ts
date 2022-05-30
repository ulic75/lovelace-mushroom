import { formatNumber, HomeAssistant, UNIT_F } from "custom-card-helpers";
import { supportsFeature } from "../../ha/common/entity/supports-feature";
import { ClimateEntity } from "../../ha/data/climate";
import { isNumber } from "../../utils/number";

export const formatDegrees = (hass: HomeAssistant, value: number | undefined, step: number) => {
    if (!isNumber(value)) return undefined;
    const options: Intl.NumberFormatOptions =
        step === 1
            ? { maximumFractionDigits: 0 }
            : { maximumFractionDigits: 1, minimumFractionDigits: 1 };
    return formatNumber(value!, hass.locale, options);
};

export const getStepSize = (hass: HomeAssistant, entity: ClimateEntity): number => {
    const systemStep = hass.config.unit_system.temperature === UNIT_F ? 1 : 0.5;
    return entity.attributes.target_temp_step ?? systemStep;
};

export const supportTargetTemperatureRange = (entity: ClimateEntity) => supportsFeature(entity, 2);

export const supportsCoolOnly = (entity: ClimateEntity) => {
    const modes = entity.attributes.hvac_modes;
    return !modes.includes("heat") && modes.includes("cool");
};

export const supportsHeatOnly = (entity: ClimateEntity) => {
    const modes = entity.attributes.hvac_modes;
    return modes.includes("heat") && !modes.includes("cool");
};

export const getTargetTemps = (entity: ClimateEntity): [number | undefined, number | undefined] => {
    const { target_temp_high, target_temp_low, temperature } = entity.attributes;

    if (supportTargetTemperatureRange(entity)) return [target_temp_low, target_temp_high];
    if (supportsHeatOnly(entity)) return [target_temp_low ?? temperature, undefined];
    return [undefined, target_temp_high ?? temperature];
};
