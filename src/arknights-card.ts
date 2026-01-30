/**
 * 明日方舟 Home Assistant 卡片
 * 使用 WebSocket API 获取数据，显示理智、基建信息，支持签到
 */

import { LitElement, html, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { cardStyles } from "./styles/card-styles";
import "./components/arknights-card-editor";
import type { HomeAssistant, ArknightsCardConfig, AccountData } from "./types";

// 卡片信息
const CARD_VERSION = "2.0.0";

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
  @state() private _accountData: AccountData | null = null;
  @state() private _loading = true;
  @state() private _error: string | null = null;

  /**
   * 设置卡片配置
   */
  public setConfig(config: ArknightsCardConfig): void {
    if (!config.uid && !config.entity && !config.account_prefix) {
      throw new Error("请选择一个账号");
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
      uid: "",
      show_header: true,
      show_sanity: true,
      show_base: true,
      show_sign_button: true,
    };
  }

  /**
   * 获取卡片大小
   */
  public getCardSize(): number {
    return 4;
  }

  protected async firstUpdated(): Promise<void> {
    await this._loadAccountData();
  }

  protected updated(changedProps: PropertyValues): void {
    // 当配置变化时重新加载数据
    if (changedProps.has("_config") && this._config?.uid) {
      this._loadAccountData();
    }
  }

  /**
   * 获取当前配置的 UID
   * 兼容旧配置（entity/account_prefix）
   */
  private _getConfiguredUid(): string | null {
    if (this._config.uid) {
      return this._config.uid;
    }
    // 向后兼容：从旧配置提取 UID（假设格式为 sensor.xxx_sanity）
    if (this._config.entity || this._config.account_prefix) {
      const prefix = this._config.account_prefix ||
        this._config.entity?.replace(/_(sanity|li_zhi)$/, "");
      // 提取 UID 部分（假设格式为 sensor.{prefix}_{...}）
      return prefix?.replace(/^sensor\./, "").split("_")[0] || null;
    }
    return null;
  }

  /**
   * 通过 WebSocket API 加载账号数据
   */
  private async _loadAccountData(): Promise<void> {
    const uid = this._getConfiguredUid();
    if (!uid || !this.hass) {
      this._error = "未配置账号";
      this._loading = false;
      return;
    }

    this._loading = true;
    this._error = null;

    try {
      const data = await this.hass.callWS<AccountData>({
        type: "arknights/get_account_data",
        uid: uid,
      });
      this._accountData = data;
    } catch (err: any) {
      console.error("Failed to load account data:", err);
      this._error = err?.message || "获取数据失败";
      this._accountData = null;
    } finally {
      this._loading = false;
    }
  }

  protected render() {
    if (!this._config || !this.hass) {
      return html`<ha-card><div class="loading">加载中...</div></ha-card>`;
    }

    if (this._loading) {
      return html`<ha-card><div class="card"><div class="loading">获取账号数据...</div></div></ha-card>`;
    }

    if (this._error || !this._accountData) {
      return html`
        <ha-card>
          <div class="card">
            <div class="error">
              <div>${this._error || "未知错误"}</div>
              <button class="retry-btn" @click=${this._loadAccountData}>重试</button>
            </div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card>
        <div class="card">
          ${this._config.show_header ? this._renderHeader() : nothing}
          ${this._config.show_sanity ? this._renderSanity() : nothing}
          ${this._config.show_base ? this._renderBase() : nothing}
          ${this._config.show_campaign !== false ? this._renderCampaign() : nothing}
          ${this._config.show_routine !== false ? this._renderRoutine() : nothing}
          ${this._config.show_sign_button ? this._renderSignButton() : nothing}
        </div>
      </ha-card>
    `;
  }

  /**
   * 渲染头部信息
   */
  private _renderHeader() {
    const data = this._accountData!;
    const name = this._config.name || data.name || "博士";
    const level = data.level || "?";

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
  private _renderSanity() {
    const sanity = this._accountData!.sanity;
    const current = sanity.current || 0;
    const max = sanity.max || 135;
    const minutesToFull = sanity.minutes_to_full || 0;

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
    const building = this._accountData!.building;

    if (!building) {
      return html`
        <div class="base-section">
          <div class="section-title">基建概览</div>
          <div class="base-unavailable">基建数据不可用</div>
        </div>
      `;
    }

    const tradingStock = building.trading_stock || 0;
    const manufactureComplete = building.manufacture_complete || 0;
    const drone = building.drone_current || 0;
    const trainingState = building.training_state || "空闲";
    const isTraining = trainingState !== "空闲";

    return html`
      <div class="base-section">
        <div class="section-title">基建概览</div>
        <div class="base-grid">
          <div class="base-item">
            <div class="base-icon">📦</div>
            <div class="base-value">${tradingStock}</div>
            <div class="base-label">贸易站</div>
          </div>
          <div class="base-item">
            <div class="base-icon">🏭</div>
            <div class="base-value">${manufactureComplete}</div>
            <div class="base-label">制造站</div>
          </div>
          <div class="base-item">
            <div class="base-icon">🤖</div>
            <div class="base-value">${drone}</div>
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
   * 渲染剿灭进度
   */
  private _renderCampaign() {
    const campaign = this._accountData!.campaign;
    if (!campaign) return nothing;

    const current = campaign.current || 0;
    const total = campaign.total || 1800;
    const percentage = Math.min((current / total) * 100, 100);

    return html`
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">⚔️ 剿灭作战</span>
          <span class="progress-value">${current} / ${total}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染任务进度
   */
  private _renderRoutine() {
    const routine = this._accountData!.routine;
    if (!routine) return nothing;

    const dailyPercent = Math.min((routine.daily_current / routine.daily_total) * 100, 100);
    const weeklyPercent = Math.min((routine.weekly_current / routine.weekly_total) * 100, 100);

    return html`
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">📋 日常任务</span>
          <span class="progress-value">${routine.daily_current} / ${routine.daily_total}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${dailyPercent}%"></div>
        </div>
        <div class="progress-header" style="margin-top: 8px;">
          <span class="progress-label">📅 周常任务</span>
          <span class="progress-value">${routine.weekly_current} / ${routine.weekly_total}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill weekly" style="width: ${weeklyPercent}%"></div>
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
  description: "明日方舟理智与基建状态卡片（WebSocket API 版本）",
});
