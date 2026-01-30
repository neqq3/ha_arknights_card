/**
 * 明日方舟 Home Assistant 卡片
 * 显示理智状态、基建信息，支持签到操作
 */

import { LitElement, html, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { cardStyles } from "./styles/card-styles";
import type { HomeAssistant, ArknightsCardConfig, SanityAttributes } from "./types";

// 卡片信息
const CARD_VERSION = "1.0.0";

console.info(
    `%c ARKNIGHTS-CARD %c v${CARD_VERSION} `,
    "color: white; background: #00b4d8; font-weight: bold;",
    "color: #00b4d8; background: white; font-weight: bold;"
);

@customElement("arknights-card")
export class ArknightsCard extends LitElement {
    static styles = cardStyles;

    @property({ attribute: false }) public hass!: HomeAssistant;
    @state() private _config!: ArknightsCardConfig;
    @state() private _signing = false;
    @state() private _signResult: string | null = null;

    /**
     * 设置卡片配置
     */
    public setConfig(config: ArknightsCardConfig): void {
        if (!config.entity) {
            throw new Error("请配置 entity 属性");
        }
        this._config = {
            show_header: true,
            show_sanity: true,
            show_base: true,
            show_sign_button: true,
            ...config,
        };
    }

    /**
     * 获取卡片默认配置
     */
    public static getConfigElement(): HTMLElement {
        return document.createElement("arknights-card-editor");
    }

    /**
     * 获取卡片 Stub 配置
     */
    public static getStubConfig(): ArknightsCardConfig {
        return {
            type: "custom:arknights-card",
            entity: "sensor.arknights_sanity",
        };
    }

    /**
     * 获取卡片大小
     */
    public getCardSize(): number {
        return 4;
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
        if (changedProps.has("_config") || changedProps.has("_signing") || changedProps.has("_signResult")) {
            return true;
        }
        if (changedProps.has("hass") && this._config?.entity) {
            const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
            if (oldHass) {
                return oldHass.states[this._config.entity] !== this.hass.states[this._config.entity];
            }
        }
        return true;
    }

    protected render() {
        if (!this._config || !this.hass) {
            return html`<ha-card><div class="loading">加载中...</div></ha-card>`;
        }

        const entityId = this._config.entity!;
        const stateObj = this.hass.states[entityId];

        if (!stateObj) {
            return html`
        <ha-card>
          <div class="card">
            <div class="error">找不到实体: ${entityId}</div>
          </div>
        </ha-card>
      `;
        }

        return html`
      <ha-card>
        <div class="card">
          ${this._config.show_header ? this._renderHeader() : nothing}
          ${this._config.show_sanity ? this._renderSanity(stateObj) : nothing}
          ${this._config.show_base ? this._renderBase() : nothing}
          ${this._config.show_sign_button ? this._renderSignButton() : nothing}
        </div>
      </ha-card>
    `;
    }

    /**
     * 渲染头部信息
     */
    private _renderHeader() {
        // 尝试获取玩家信息
        const levelEntity = this.hass.states["sensor.arknights_level"];
        const level = levelEntity?.state || "?";
        const name = this._config.name || levelEntity?.attributes?.friendly_name?.replace(" 等级", "") || "博士";

        return html`
      <div class="header">
        <div class="avatar">
          <svg viewBox="0 0 64 64" width="64" height="64">
            <rect fill="#0a0a14" width="64" height="64" rx="8"/>
            <text x="32" y="40" text-anchor="middle" fill="#00b4d8" font-size="24">DR</text>
          </svg>
        </div>
        <div class="player-info">
          <div class="player-name">${name}</div>
          <div class="player-level">博士等级 <span>Lv.${level}</span></div>
        </div>
      </div>
    `;
    }

    /**
     * 渲染理智信息
     */
    private _renderSanity(stateObj: { state: string; attributes: SanityAttributes }) {
        const current = parseInt(stateObj.state) || 0;
        const max = stateObj.attributes?.max || 135;
        const minutesToFull = stateObj.attributes?.minutes_to_full || 0;

        const percentage = Math.min((current / max) * 100, 100);
        const circumference = 2 * Math.PI * 32;
        const offset = circumference - (percentage / 100) * circumference;

        // 格式化恢复时间
        let recoveryText = "已满";
        let isFull = current >= max;
        if (!isFull && minutesToFull > 0) {
            const hours = Math.floor(minutesToFull / 60);
            const mins = minutesToFull % 60;
            if (hours > 0) {
                recoveryText = `${hours}小时${mins}分钟后回满`;
            } else {
                recoveryText = `${mins}分钟后回满`;
            }
        }

        return html`
      <div class="sanity-section">
        <div class="sanity-ring">
          <svg viewBox="0 0 80 80">
            <circle class="bg" cx="40" cy="40" r="32" />
            <circle
              class="progress"
              cx="40"
              cy="40"
              r="32"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"
            />
          </svg>
          <div class="value">${Math.round(percentage)}%</div>
        </div>
        <div class="sanity-info">
          <div class="sanity-label">理智</div>
          <div class="sanity-value">
            ${current} <span>/ ${max}</span>
          </div>
          <div class="recovery-time ${isFull ? "full" : ""}">
            ${recoveryText}
          </div>
        </div>
      </div>
    `;
    }

    /**
     * 渲染基建概览
     */
    private _renderBase() {
        const getState = (suffix: string) => {
            const entity = this.hass.states[`sensor.arknights_${suffix}`];
            return entity?.state || "0";
        };

        const getAttr = (suffix: string, attr: string) => {
            const entity = this.hass.states[`sensor.arknights_${suffix}`];
            return entity?.attributes?.[attr];
        };

        const tradingStock = parseInt(getState("trading_stock")) || 0;
        const tradingLimit = getAttr("trading_stock", "limit") || 9;
        const isTradeWarning = tradingStock >= tradingLimit;

        const manufactureComplete = parseInt(getState("manufacture_complete")) || 0;
        const drone = parseInt(getState("drone")) || 0;
        const droneMax = getAttr("drone", "max") || 200;
        const isDroneWarning = drone >= droneMax * 0.9;

        const trainingState = getState("training_state");
        const isTraining = trainingState !== "空闲" && trainingState !== "0";

        return html`
      <div class="base-section">
        <div class="section-title">基建概览</div>
        <div class="base-grid">
          <div class="base-item ${isTradeWarning ? "warning" : ""}">
            <div class="base-icon">📦</div>
            <div class="base-value ${isTradeWarning ? "warning" : ""}">${tradingStock}</div>
            <div class="base-label">贸易站</div>
          </div>
          <div class="base-item">
            <div class="base-icon">🏭</div>
            <div class="base-value">${manufactureComplete}</div>
            <div class="base-label">制造站</div>
          </div>
          <div class="base-item ${isDroneWarning ? "warning" : ""}">
            <div class="base-icon">🤖</div>
            <div class="base-value ${isDroneWarning ? "warning" : ""}">${drone}</div>
            <div class="base-label">无人机</div>
          </div>
          <div class="base-item">
            <div class="base-icon">${isTraining ? "📚" : "💤"}</div>
            <div class="base-value">${isTraining ? "训练中" : "空闲"}</div>
            <div class="base-label">训练室</div>
          </div>
        </div>
      </div>
    `;
    }

    /**
     * 渲染签到按钮
     */
    private _renderSignButton() {
        return html`
      <button
        class="sign-button ${this._signResult?.includes("成功") ? "success" : ""}"
        @click=${this._handleSign}
        ?disabled=${this._signing}
      >
        ${this._signing
                ? html`<span class="loading-pulse">签到中...</span>`
                : this._signResult
                    ? this._signResult
                    : html`<span>📝</span> 森空岛签到`}
      </button>
    `;
    }

    /**
     * 处理签到
     */
    private async _handleSign() {
        if (this._signing) return;

        this._signing = true;
        this._signResult = null;

        try {
            await this.hass.callService("arknights", "sign", {});
            this._signResult = "✓ 签到成功";
        } catch (error) {
            console.error("签到失败:", error);
            this._signResult = "签到失败";
        } finally {
            this._signing = false;
            // 3秒后重置按钮状态
            setTimeout(() => {
                this._signResult = null;
                this.requestUpdate();
            }, 3000);
        }
    }
}

// 注册卡片到 window
declare global {
    interface HTMLElementTagNameMap {
        "arknights-card": ArknightsCard;
    }
    interface Window {
        customCards?: Array<{ type: string; name: string; description: string }>;
    }
}

// 注册到 Home Assistant 自定义卡片列表
window.customCards = window.customCards || [];
window.customCards.push({
    type: "arknights-card",
    name: "Arknights Card",
    description: "明日方舟理智与基建状态卡片",
});
