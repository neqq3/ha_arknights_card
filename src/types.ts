/**
 * Home Assistant 相关类型定义
 */

import { HassEntity, HassServices } from "home-assistant-js-websocket";

/**
 * Home Assistant 实例类型
 */
export interface HomeAssistant {
    states: { [entityId: string]: HassEntity };
    services: HassServices;
    callService: (
        domain: string,
        service: string,
        serviceData?: object
    ) => Promise<void>;
    language: string;
    locale: {
        language: string;
        number_format: string;
    };
}

/**
 * Lovelace 卡片配置
 */
export interface ArknightsCardConfig {
    type: string;
    entity?: string;           // 向后兼容：旧配置使用的理智实体
    account_prefix?: string;   // 新配置：账号实体前缀（如 "sensor.8527"）
    name?: string;
    show_header?: boolean;
    show_sanity?: boolean;
    show_base?: boolean;
    show_sign_button?: boolean;
    [key: string]: any;
}

/**
 * 理智信息
 */
export interface SanityAttributes {
    current: number;
    max: number;
    minutes_to_full: number;
    recovery_time: string | null;
    unit_of_measurement?: string;
    friendly_name?: string;
}

/**
 * 基建状态
 */
export interface BaseStatus {
    trading_stock: number;
    trading_limit: number;
    manufacture_complete: number;
    drone: number;
    drone_max: number;
    training_state: string;
    recruit_finished: number;
    clue_collected: number;
    tired_count: number;
}
