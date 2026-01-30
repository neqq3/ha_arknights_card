import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, ArknightsCardConfig, ArknightsAccount, ListAccountsResponse } from "../types";

const fireEvent = (node: HTMLElement, type: string, detail: object) => {
    const event = new Event(type, {
        bubbles: true,
        cancelable: false,
        composed: true,
    });
    (event as any).detail = detail;
    node.dispatchEvent(event);
    return event;
};

@customElement("arknights-card-editor")
export class ArknightsCardEditor extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;
    @state() private _config!: ArknightsCardConfig;
    @state() private _accounts: ArknightsAccount[] = [];
    @state() private _loading = true;
    @state() private _error: string | null = null;

    public setConfig(config: ArknightsCardConfig): void {
        this._config = config;
    }

    protected async firstUpdated(): Promise<void> {
        await this._loadAccounts();
    }

    /**
     * 通过 WebSocket API 加载账号列表
     */
    private async _loadAccounts(): Promise<void> {
        if (!this.hass) return;

        this._loading = true;
        this._error = null;

        try {
            const response = await this.hass.callWS<ListAccountsResponse>({
                type: "arknights/list_accounts",
            });
            this._accounts = response.accounts || [];
        } catch (err) {
            console.error("Failed to load accounts:", err);
            this._error = "无法加载账号列表，请确认后端集成已配置";
            this._accounts = [];
        } finally {
            this._loading = false;
        }
    }

    protected render() {
        if (!this.hass || !this._config) {
            return nothing;
        }

        if (this._loading) {
            return html`<div class="card-config"><div class="loading">加载账号列表...</div></div>`;
        }

        return html`
            <div class="card-config">
                <div class="option">
                    <label>选择账号</label>
                    ${this._error ? html`
                        <div class="error">${this._error}</div>
                        <button class="retry-btn" @click=${this._loadAccounts}>重试</button>
                    ` : html`
                        <select
                            .value=${this._config.uid || ""}
                            @change=${this._accountChanged}
                        >
                            <option value="" ?selected=${!this._config.uid}>请选择账号</option>
                            ${this._accounts.map((account) => html`
                                <option 
                                    value=${account.uid} 
                                    ?selected=${this._config.uid === account.uid}
                                >
                                    ${account.name} (UID: ${account.uid}, Lv.${account.level})
                                </option>
                            `)}
                        </select>
                        <div class="hint">
                            ${this._accounts.length > 0
                    ? `检测到 ${this._accounts.length} 个账号`
                    : "未检测到账号，请先在后端添加明日方舟账号"}
                        </div>
                    `}
                </div>
                <div class="option">
                    <label>自定义名称（可选）</label>
                    <input
                        type="text"
                        .value=${this._config.name || ""}
                        .configValue=${"name"}
                        @input=${this._valueChanged}
                        placeholder="留空则使用游戏昵称"
                    />
                </div>
                <div class="switches">
                    ${this._renderSwitch("show_header", "显示头部", true)}
                    ${this._renderSwitch("show_sanity", "显示理智", true)}
                    ${this._renderSwitch("show_base", "显示基建", true)}
                    ${this._renderSwitch("show_sign_button", "显示签到按钮", true)}
                </div>
            </div>
        `;
    }

    private _renderSwitch(key: string, label: string, defaultValue: boolean) {
        const checked = this._config[key] !== undefined ? this._config[key] : defaultValue;
        return html`
            <div class="switch">
                <input
                    type="checkbox"
                    id=${key}
                    .checked=${checked}
                    .configValue=${key}
                    @change=${this._valueChanged}
                />
                <label for=${key}>${label}</label>
            </div>
        `;
    }

    private _accountChanged(ev: Event): void {
        const target = ev.target as HTMLSelectElement;
        const uid = target.value;

        // 清除旧的配置字段
        const newConfig: ArknightsCardConfig = {
            ...this._config,
            uid: uid || undefined,
        };
        delete newConfig.entity;
        delete newConfig.account_prefix;

        this._config = newConfig;
        fireEvent(this, "config-changed", { config: this._config });
    }

    private _valueChanged(ev: Event): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target as any;
        const configValue = target.configValue;
        if (!configValue) return;

        const value = target.type === "checkbox" ? target.checked : target.value;

        if (value === "" || value === undefined) {
            const newConfig = { ...this._config };
            delete newConfig[configValue];
            this._config = newConfig;
        } else {
            this._config = {
                ...this._config,
                [configValue]: value,
            };
        }
        fireEvent(this, "config-changed", { config: this._config });
    }

    static styles = css`
        .card-config {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .option {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        label {
            font-weight: 500;
            color: var(--primary-text-color);
        }
        select, input[type="text"] {
            padding: 10px 12px;
            border: 1px solid var(--divider-color, #e0e0e0);
            border-radius: 8px;
            background: var(--card-background-color, #fff);
            color: var(--primary-text-color);
            font-size: 14px;
            width: 100%;
            box-sizing: border-box;
        }
        select:focus, input[type="text"]:focus {
            outline: none;
            border-color: var(--primary-color, #03a9f4);
        }
        .hint {
            font-size: 12px;
            color: var(--secondary-text-color);
        }
        .loading {
            color: var(--secondary-text-color);
            padding: 16px;
            text-align: center;
        }
        .error {
            color: var(--error-color, #f44336);
            font-size: 14px;
            padding: 8px;
            background: rgba(244, 67, 54, 0.1);
            border-radius: 4px;
        }
        .retry-btn {
            padding: 8px 16px;
            border: 1px solid var(--primary-color);
            border-radius: 4px;
            background: transparent;
            color: var(--primary-color);
            cursor: pointer;
            font-size: 14px;
        }
        .retry-btn:hover {
            background: var(--primary-color);
            color: white;
        }
        .switches {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        .switch {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .switch input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        .switch label {
            font-weight: normal;
            cursor: pointer;
        }
    `;
}
