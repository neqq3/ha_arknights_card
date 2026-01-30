/**
 * 明日方舟风格卡片样式
 * 深色主题 + 青色强调色 + Glassmorphism 效果
 */

import { css } from "lit";

export const cardStyles = css`
  :host {
    --ak-primary: #00b4d8;
    --ak-primary-dark: #0096b7;
    --ak-secondary: #f8b500;
    --ak-bg-dark: #1a1a2e;
    --ak-bg-card: rgba(26, 26, 46, 0.85);
    --ak-bg-glass: rgba(255, 255, 255, 0.05);
    --ak-text: #e8e8e8;
    --ak-text-secondary: #9a9ab0;
    --ak-border: rgba(0, 180, 216, 0.3);
    --ak-success: #00e676;
    --ak-warning: #ff9800;
    --ak-danger: #ff5252;
  }

  .card {
    background: var(--ak-bg-card);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid var(--ak-border);
    padding: 20px;
    color: var(--ak-text);
    font-family: "Roboto", "Noto Sans SC", sans-serif;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  /* 头部区域 */
  .header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--ak-border);
  }

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    border: 2px solid var(--ak-primary);
    object-fit: cover;
    background: var(--ak-bg-glass);
  }

  .player-info {
    flex: 1;
  }

  .player-name {
    font-size: 1.3em;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: var(--ak-text);
  }

  .player-level {
    font-size: 0.9em;
    color: var(--ak-text-secondary);
  }

  .player-level span {
    color: var(--ak-primary);
    font-weight: 600;
  }

  /* 理智环 */
  .sanity-section {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    padding: 16px;
    background: var(--ak-bg-glass);
    border-radius: 12px;
  }

  .sanity-ring {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .sanity-ring svg {
    transform: rotate(-90deg);
    width: 80px;
    height: 80px;
  }

  .sanity-ring circle {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
  }

  .sanity-ring .bg {
    stroke: var(--ak-bg-glass);
  }

  .sanity-ring .progress {
    stroke: var(--ak-primary);
    transition: stroke-dashoffset 0.5s ease;
    filter: drop-shadow(0 0 6px var(--ak-primary));
  }

  .sanity-ring .value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.1em;
    font-weight: 700;
    color: var(--ak-text);
  }

  .sanity-info {
    flex: 1;
  }

  .sanity-label {
    font-size: 0.85em;
    color: var(--ak-text-secondary);
    margin-bottom: 4px;
  }

  .sanity-value {
    font-size: 1.5em;
    font-weight: 700;
    color: var(--ak-primary);
  }

  .sanity-value span {
    font-size: 0.6em;
    color: var(--ak-text-secondary);
    font-weight: 400;
  }

  .recovery-time {
    font-size: 0.85em;
    color: var(--ak-text-secondary);
    margin-top: 8px;
  }

  .recovery-time.full {
    color: var(--ak-success);
  }

  /* 基建网格 */
  .base-section {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 0.85em;
    color: var(--ak-text-secondary);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .base-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .base-item {
    background: var(--ak-bg-glass);
    border-radius: 10px;
    padding: 12px 8px;
    text-align: center;
    transition: transform 0.2s, background 0.2s;
  }

  .base-item:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.08);
  }

  .base-item.warning {
    border: 1px solid var(--ak-warning);
  }

  .base-icon {
    font-size: 1.5em;
    margin-bottom: 6px;
  }

  .base-value {
    font-size: 1.1em;
    font-weight: 600;
    color: var(--ak-text);
  }

  .base-value.warning {
    color: var(--ak-warning);
  }

  .base-label {
    font-size: 0.7em;
    color: var(--ak-text-secondary);
    margin-top: 4px;
  }

  /* 签到按钮 */
  .sign-button {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, var(--ak-primary), var(--ak-primary-dark));
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 1em;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .sign-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 180, 216, 0.4);
  }

  .sign-button:active {
    transform: translateY(0);
  }

  .sign-button:disabled {
    background: var(--ak-text-secondary);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .sign-button.success {
    background: var(--ak-success);
  }

  /* 加载状态 */
  .loading {
    text-align: center;
    padding: 40px;
    color: var(--ak-text-secondary);
  }

  /* 错误状态 */
  .error {
    text-align: center;
    padding: 20px;
    color: var(--ak-danger);
  }

  /* 动画 */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .loading-pulse {
    animation: pulse 1.5s infinite;
  }
`;
