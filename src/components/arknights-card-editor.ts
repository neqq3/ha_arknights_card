import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { HomeAssistant, ArknightsCardConfig } from "../types";

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

interface ArknightsAccount {
    prefix: string;      // 实体前缀，如 "sensor.8527"
    name: string;        // 账号名称
    uid: string;         // UID
    displayName: string; // 显示名称
}

@customElement("arknights-card-editor")
export class ArknightsCardEditor extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;
    @state() private _config!: ArknightsCardConfig;

    public setConfig(config: ArknightsCardConfig): void {
        this._config = config;
    }

    /**
     * 检测所有 Arknights 账号
     * 通过扫描 sensor.xxx_sanity 或 sensor.xxx_li_zhi 实体来发现账号
     */
    private _detectAccounts(): ArknightsAccount[] {
        if (!this.hass) return [];

        const accounts = new Map<string, ArknightsAccount>();

        for (const entityId of Object.keys(this.hass.states)) {
            // 匹配理智实体：xxx_sanity 或 xxx_li_zhi
            const match = entityId.match(/^(sensor\..+?)_(sanity|li_zhi)$/);
            if (!match) continue;

            const prefix = match[1];
            if (accounts.has(prefix)) continue;

            // 从 level 实体获取账号名和 UID
            const levelEntity = this.hass.states[`${prefix}_level`];
            const name = levelEntity?.attributes?.name || "未知账号";
            const uid = levelEntity?.attributes?.uid || prefix.replace("sensor.", "");

            accounts.set(prefix, {
                prefix,
                name,
                uid,
                displayName: `${name} (${uid})`,
            });
        }

        return Array.from(accounts.values());
    }

    /**
     * 获取当前选中的账号前缀
     * 兼容旧配置（entity）和新配置（account_prefix）
     */
    private _getCurrentPrefix(): string {
        if (this._config.account_prefix) {
            return this._config.account_prefix;
        }
        if (this._config.entity) {
            // 从旧配置的 entity 提取前缀
            return this._config.entity.replace(/_(sanity|li_zhi)$/, "");
        }
        return "";
    }

    protected render() {
        if (!this.hass || !this._config) {
            return nothing;
        }

        const accounts = this._detectAccounts();
        const currentPrefix = this._getCurrentPrefix();

        return html`
            <div class="card-config">
                <div class="option">
                    <label>选择账号</label>
                    <select
                        .value=${currentPrefix}
                        @change=${this._accountChanged}
                    >
                        <option value="" ?selected=${!currentPrefix}>请选择账号</option>
                        ${accounts.map((account) => html`
                            <option 
                                value=${account.prefix} 
                                ?selected=${currentPrefix === account.prefix}
                            >
                                ${account.displayName}
                            </option>
                        `)}
                    </select>
                    ${accounts.length === 0 ? html`
                        <div class="hint warning">未检测到明日方舟账号，请确认后端集成已配置</div>
                    ` : html`
                        <div class="hint">检测到 ${accounts.length} 个账号</div>
                    `}
                </div>
                <div class="option">
                    <label>自定义名称（可选）</label>
                    <input
                        type="text"
                        .value=${this._config.name || ""}
                        .configValue=${"name"}
                        @input=${this._valueChanged}
                        placeholder="留空则使用账号昵称"
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
        const newPrefix = target.value;

        // 更新配置：使用新的 account_prefix，清除旧的 entity
        const newConfig = {
            ...this._config,
            account_prefix: newPrefix || undefined,
        };
        // 移除旧的 entity 配置（如果使用了新的 account_prefix）
        if (newPrefix) {
            delete newConfig.entity;
        }

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
        .hint.warning {
            color: var(--error-color, #f44336);
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
