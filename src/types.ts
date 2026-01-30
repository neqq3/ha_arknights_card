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
    callWS: <T>(message: { type: string;[key: string]: any }) => Promise<T>;
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
    uid?: string;              // 账号 UID
    name?: string;             // 自定义名称
    show_header?: boolean;
    show_sanity?: boolean;
    show_base?: boolean;
    show_sign_button?: boolean;
    // 向后兼容旧配置
    entity?: string;
    account_prefix?: string;
    // 允许动态属性访问
    [key: string]: any;
}

// ============ WebSocket API 类型 ============

/**
 * 账号摘要（list_accounts 返回）
 */
export interface ArknightsAccount {
    uid: string;
    name: string;
    level: number;
}

/**
 * list_accounts 响应
 */
export interface ListAccountsResponse {
    accounts: ArknightsAccount[];
}

/**
 * 理智信息
 */
export interface SanityData {
    current: number;
    max: number;
    minutes_to_full: number;
    complete_recovery_time: number;
}

/**
 * 基建信息
 */
export interface BuildingData {
    trading_stock: number;
    manufacture_complete: number;
    drone_current: number;
    training_state: string;
    tired_count?: number;
}

/**
 * get_account_data 响应
 */
export interface AccountData {
    uid: string;
    name: string;
    level: number;
    avatar_url?: string;
    secretary_id?: string;
    sanity: SanityData;
    building: BuildingData | null;
    skin_count?: number;
    char_count?: number;
}

// ============ 旧类型（向后兼容） ============

/**
 * 理智属性（旧版实体格式）
 * @deprecated 使用 SanityData 代替
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
 * 基建状态（旧版实体格式）
 * @deprecated 使用 BuildingData 代替
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
