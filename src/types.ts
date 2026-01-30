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
    show_campaign?: boolean;   // 显示剿灭进度
    show_routine?: boolean;    // 显示任务进度
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
    training_state: string;  // "空闲中" | "训练中" | "未建造"
    clue_board?: Record<string, boolean>;  // 线索板 "1"-"7"
    tired_count?: number;
}

/**
 * 剿灭作战信息
 */
export interface CampaignData {
    current: number;
    total: number;  // 通常 1800
}

/**
 * 日常/周常任务
 */
export interface RoutineData {
    daily_current: number;
    daily_total: number;
    weekly_current: number;
    weekly_total: number;
}

/**
 * 保全派驻信息
 */
export interface TowerData {
    higher_current: number;
    higher_total: number;
    lower_current: number;
    lower_total: number;
    term_ts: number;
}

/**
 * 助战干员
 */
export interface AssistChar {
    char_id: string;
    skin_id?: string;
    level: number;
    evolve_phase: number;  // 0-2
    potential_rank?: number;  // 0-5
    skill_id?: string;
    skill_level?: number;
    specialize_level?: number;  // 0-3
}

/**
 * get_account_data 完整响应
 */
export interface AccountData {
    uid: string;
    name: string;
    level: number;
    avatar_url?: string;
    secretary_id?: string;
    medal_count?: number;
    sanity: SanityData;
    building: BuildingData | null;
    campaign: CampaignData | null;
    routine: RoutineData | null;
    tower: TowerData | null;
    assist_chars?: AssistChar[];
}
