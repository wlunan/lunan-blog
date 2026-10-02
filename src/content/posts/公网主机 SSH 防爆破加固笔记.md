---
title: "公网主机 SSH 防爆破加固笔记"
published: 2026-10-02
updated: 2026-10-02
description: "从关闭密码认证、改用密钥登录，到 fail2ban 与防火墙兜底，记录一次完整的 SSH 公网加固流程、配置生效顺序和常见坑。"
tags: [SSH, 安全加固, Linux, 服务器]
category: "教程"
draft: false
---

> 适用场景：家里/学校的迷你主机、VPS、云服务器等**有公网 IP 且开放 22 端口**的 Linux 机器。

目标很明确：让 SSH 从「可以被无限次猜密码」变成「没有私钥就永远进不来」。下面按 **先修好新门 → 验证能进 → 再拆旧门** 的顺序，记录整套加固流程。

---

## 一、问题的真实样子

面板的登录日志长这样：

```text
Oct  2 09:14:02 sshd[13221]: Failed password for root from 45.148.x.x port 51234 ssh2
Oct  2 09:14:03 sshd[13222]: Failed password for invalid user admin from 191.36.x.x port 44120 ssh2
Oct  2 09:14:05 sshd[13223]: Failed password for invalid user ubuntu from 5.188.x.x port 33718 ssh2
Oct  2 09:14:07 sshd[13224]: Connection closed by authenticating user user 42.193.x.x port 28011 [preauth]
```

- 登录 IP 来自世界各地（上海、荷兰、俄罗斯、巴西……）；
- 用户名永远是那几个高频词：`root`、`user`、`admin`、`ubuntu`；
- **密码和密钥两种方式都会被尝试**；
- 累计失败记录已经 **108830 条**，而且这是常态，不是被针对。

结论：只要 22 端口对公网开放，**被爆破是必然事件，不是概率事件**。密码只要够弱，只是时间问题。

---

## 二、核心思路：把「可爆破面」降到零

三条原则，按重要性排序：

| 原则 | 做法 | 效果 |
|---|---|---|
| ① 关掉一切口令入口 | `PasswordAuthentication no` | 攻击者再猜密码也无效，爆破直接归零 |
| ② 只留公钥认证 | 私钥留在自己电脑（且带口令） | 没有私钥文件 = 无法登录，与密码强度无关 |
| ③ 加封禁 + 白名单兜底 | fail2ban + 防火墙/安全组 | 把扫描 IP 直接砍掉，降低日志噪音和资源消耗 |

> **一句话本质**：不是"把密码设复杂一点"，而是**把密码登录这个功能关掉**。

---

## 三、操作顺序（顺序错了会把自己锁在外面）

**总原则：先修好新门，验证能进，再拆旧门。**

不要先改 `sshd_config` 再想办法配密钥——中间一旦出错，SSH 断了，只能去云控制台 VNC 或现场接显示器。

### 步骤 0：准备工作

- 用 root 密码正常登录一次（这是最后一次用密码）。
- **全程保留当前这个已登录的窗口不要关**，所有验证都在**新开一个终端窗口**里做。
- 确认云厂商控制台的网页 VNC / 救援模式可用（最后的逃生通道）。

### 步骤 1：创建普通用户并给提权权限

```bash
# 创建用户（-m 建家目录，-s 指定 shell）
useradd -m -s /bin/bash ops
passwd ops                 # 给普通用户设一个密码（本地登录/备用）

# Debian/Ubuntu：加入 sudo 组
usermod -aG sudo ops
# CentOS/RHEL：加入 wheel 组
# usermod -aG wheel ops
```

### 步骤 2：在自己电脑上生成密钥对

> Windows 用 PowerShell 或 Git Bash，macOS/Linux 用终端。

```bash
# ed25519 比 RSA 更短更安全，现代系统都支持
ssh-keygen -t ed25519 -C "xiaonan@home-pc"
```

会问两件事：
1. 保存路径 → 默认 `~/.ssh/id_ed25519` 即可（Windows 是 `C:\Users\xiaonan\.ssh\id_ed25519`）；
2. **passphrase（私钥口令）→ 强烈建议设置**。私钥文件被偷了，还有第二道锁。

只有 `.pub` 结尾的**公钥**可以往外传，**私钥（无 .pub 后缀）永远不能复制到服务器上**。

### 步骤 3：把公钥传到服务器的普通用户

```bash
# Linux / macOS / Git Bash 有 ssh-copy-id
ssh-copy-id -i ~/.ssh/id_ed25519.pub ops@你的服务器IP
```

Windows 没有 `ssh-copy-id` 时手动追加：

```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh ops@你的服务器IP "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### 步骤 4：验证（最关键的一步，先别改配置）

**新开一个终端窗口**：

```bash
ssh -i ~/.ssh/id_ed25519 ops@你的服务器IP     # 应能免密码登录
sudo whoami                                  # 应输出 root，证明提权可用
```

✅ 两条都通过后，才继续下一步。任一条失败就先排查（见第九节）。

### 步骤 5：修改 sshd 配置

```bash
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak   # 先备份
sudo nano /etc/ssh/sshd_config
```

需要确保生效的关键项：

```ini
# 禁止 root 直接 SSH 登录（含密码和密钥）——只能先登普通用户再提权
PermitRootLogin no

# 开启公钥认证
PubkeyAuthentication yes

# 关闭密码认证 —— 防爆破的核心开关
PasswordAuthentication no

# 关闭键盘交互认证（重要！否则 PAM 可能仍允许输入密码，等于没关）
KbdInteractiveAuthentication no
# 老版本用：ChallengeResponseAuthentication no

# 用户白名单：只有这些账号能 SSH，其他一律拒绝
AllowUsers ops

# 降低尝试次数、缩短握手时间
MaxAuthTries 3
LoginGraceTime 30

# 禁用没用的转发能力
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no

UsePAM yes
```

> ⚠️ **Ubuntu 22.10+ / Debian 12 的经典坑**：`/etc/ssh/sshd_config` 顶部有
> `Include /etc/ssh/sshd_config.d/*.conf`，而 sshd 对同一参数**取"最先出现"的值**。
> 所以 `50-cloud-init.conf` 里的 `PasswordAuthentication yes` 会**覆盖你在主文件末尾的修改**。
> 处理办法：单独建一个 drop-in 文件，或者改掉那个 conf：
>
> ```bash
> sudo nano /etc/ssh/sshd_config.d/99-hardening.conf
> # 内容：PasswordAuthentication no
> ```
>
> **永远以实际生效值为准**，不要只看自己改的那一行：
>
> ```bash
> sudo sshd -T | grep -Ei 'passwordauth|permitrootlogin|pubkeyauth|kbdinteractive|allowusers'
> ```

### 步骤 6：校验 → 重载 → 再验证

```bash
sudo sshd -t                                    # 语法检查，无输出=通过
sudo systemctl reload sshd                      # 或 reload ssh / sshd
```

**再次新开窗口验证**，同时故意验证密码已失效：

```bash
ssh ops@你的服务器IP                            # 密钥登录，成功
ssh -o PreferredAuthentications=password -o PubkeyAuthentication=no ops@你的服务器IP
# 应该直接被拒绝（Permission denied），说明密码通道确实关了
```

确认无误后，才可以关掉最开始的 root 窗口。

### 步骤 7：fail2ban 自动封禁

```bash
sudo apt install fail2ban -y                    # Debian/Ubuntu
# sudo dnf install fail2ban -y                  # CentOS/RHEL

sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local   # 改 local，不动 conf
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
# Debian/Ubuntu 新版日志走 journald，必须写 systemd，否则监控不到
backend  = systemd
bantime  = 1h            # 封禁时长
findtime = 10m           # 统计窗口
maxretry = 5             # 窗口内失败 5 次即封
# 白名单：写自己的常用出口 IP，避免误封自己
ignoreip = 127.0.0.1/8 ::1 1.2.3.4

[sshd]
enabled  = true
port     = ssh           # 若改过端口，填新端口号
logpath  = %(sshd_log)s
```

```bash
sudo systemctl enable --now fail2ban
sudo systemctl status fail2ban
sudo fail2ban-client status sshd          # 看当前封禁了哪些 IP
```

常用管理：

```bash
sudo fail2ban-client set sshd unbanip 1.2.3.4   # 手动解封（自己被困时用）
sudo fail2ban-client status sshd
```

### 步骤 8：防火墙 + 云安全组兜底

```bash
# UFW（Ubuntu）
sudo ufw allow 22/tcp
sudo ufw enable

# firewalld（CentOS/RHEL）
sudo firewall-cmd --permanent --add-service=ssh && sudo firewall-cmd --reload
```

**云服务器一定要额外看安全组**：安全组是最外层，建议把 22 端口限制为只允许你自己的出口 IP（缺点是家宽动态 IP 变了要改）。

### 步骤 9（可选）：换掉默认端口

```ini
Port 22022
```

- 风险：改完必须同步改防火墙、安全组、fail2ban 的 `port`，否则自断后路；
- 收益：**只降低日志噪音**（自动化扫描默认打 22），**不提升实际安全性**（全端口扫描照样能找到）。
- 别把换端口当成安全措施，真正的安全来自第 1、2 条原则。

---

## 四、关于「登录普通用户后 su/sudo 到 root」

这是本方案里唯一需要想清楚的地方，两种提权方式都能用，但**推荐 sudo**：

| 对比 | `su root` | `sudo` |
|---|---|---|
| 需要什么密码 | **root 的密码** | **当前用户自己的密码** |
| root 密码锁定时的可用性 | ❌ 不可用（Ubuntu 默认 root 无密码，`su` 直接失败） | ✅ 仍可用 |
| 审计日志 | 只有"某人切换成了 root" | 记录**谁、在哪、执行了哪条命令** |
| 权限粒度 | 全有或全无 | 可只授权特定命令（visudo） |
| 默认超时 | 每次都要重新 su | 默认 15 分钟内免密 |

关键结论：

1. **`PermitRootLogin` 只管 SSH 登录，不影响本地 `su` / `sudo`。**
   所以"禁止 root 远程登录 + 普通用户登录后提权"完全可行，两者不冲突。
2. 如果确实要用 `su root`，root 必须**有本地密码**（`sudo passwd root`）。
   但这等于又开了一个口令入口，且 root 密码无法被 sudo 的日志审计 —— **不推荐**。
3. **`ops` 用户有了 sudo，就等于有 root 权限。** 所以真正的"钥匙"变成了那对密钥：
   - 私钥文件权限 `600`，绝不外传、不进 Git、不进网盘明文同步；
   - 私钥设置 passphrase；
   - 换电脑或怀疑泄露时，直接换密钥对（删掉服务器上的旧公钥）。
4. 有些教程会把 `sshd_config` 里写成 `PermitRootLogin prohibit-password`：那是"root 可以用密钥登录但不能用密码"，比 `no` 宽松。既然要"只能先登普通用户"，就写 `no`。

---

## 五、客户端配置（省掉每次敲一长串参数）

`~/.ssh/config`（Windows 同样路径 `C:\Users\xiaonan\.ssh\config`）：

```ini
Host myserver
    HostName 你的服务器IP
    Port 22
    User ops
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes        # 只试这一把钥匙，避免认证被拒次数超限
    ServerAliveInterval 60    # 心跳保活，防止空闲被踢
    ServerAliveCountMax 3
```

之后直接：

```bash
ssh myserver
```

> `IdentitiesOnly yes` 很重要：本机有多把密钥时，SSH 会挨个试，容易撞上 `MaxAuthTries` 被拒，或者被 fail2ban 记成失败。

---

## 六、权限检查清单（90% 的"密钥登录失败"都在这）

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/id_ed25519        # 私钥（本地）
chmod 644 ~/.ssh/id_ed25519.pub
chmod 755 /home/ops                # 家目录不能是组/其他人可写
```

自查命令：

```bash
ls -ld /home/ops ~/.ssh ~/.ssh/authorized_keys
```

如果开了 SELinux（CentOS/RHEL）还要恢复上下文：

```bash
sudo restorecon -Rv ~/.ssh
```

---

## 七、分析爆破日志

```bash
# 今日 SSH 失败记录（Debian/Ubuntu）
sudo journalctl -u ssh --since today | grep -i "failed"

# 老系统（syslog）
sudo grep "Failed password" /var/log/auth.log | tail -50

# 统计攻击来源 TOP 20
sudo grep "Failed password" /var/log/auth.log \
  | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr | head -20

# 被尝试最多的用户名
sudo grep "Failed password" /var/log/auth.log \
  | grep -oP 'for (invalid user )?\K\S+' | sort | uniq -c | sort -nr | head

# 失败登录（含来源 IP、时间）
sudo lastb | head -30

# 成功登录记录（重点看有没有陌生 IP / 陌生用户）
last -a | head -20
```

---

## 八、如果担心「已经被攻破」的自查

爆破失败不代表没被得手，加固后建议顺手查一遍：

```bash
# 1. authorized_keys 里有没有陌生的公钥（最常见后门）
cat ~/.ssh/authorized_keys
sudo cat /root/.ssh/authorized_keys

# 2. 有没有偷偷新增的用户
awk -F: '$3>=1000 && $3<65534 {print $1, $3, $6, $7}' /etc/passwd
sudo grep -vE '^#|^$' /etc/sudoers /etc/sudoers.d/* 2>/dev/null

# 3. 有没有可疑的计划任务
crontab -l; sudo crontab -l; ls -la /etc/cron.*/ /etc/cron.d/

# 4. 有没有可疑的监听端口 / 进程
sudo ss -tlnp

# 5. 最近被修改过的系统文件
sudo find /etc /usr/bin /usr/sbin -mtime -7 -type f 2>/dev/null | head -30
```

发现陌生公钥：立刻删除，然后**换掉整对密钥**，并排查其他后门。

---

## 九、常见坑与排错

| 现象 | 原因 | 解决 |
|---|---|---|
| 改了 `PasswordAuthentication no` 但密码还能登 | `/etc/ssh/sshd_config.d/*.conf` 里的值优先生效 | 用 `sudo sshd -T \| grep -i passwordauth` 看实际值，建 drop-in 覆盖 |
| 密钥登录报 `Permission denied (publickey)` | 权限不对 / 家目录组可写 / 公钥内容被换行截断 | 按第六节逐项 `chmod`，重新 `ssh-copy-id` |
| 密钥登录成功但 `sudo` 要密码 | 用户不在 `sudo`/`wheel` 组，或用户名拼错 | `groups ops` 确认组；`usermod -aG sudo ops` 后重新登录 |
| 关掉密码登录后连不上，慌了 | 改配置前没有保留已登录会话 / 没做统一验证 | 用云控制台 VNC 登录，`cp sshd_config.bak sshd_config && systemctl restart sshd` |
| fail2ban 显示 running 但从不封人 | 日志路径不对（journald vs 文件），jail 没启用 | `backend = systemd`，确认 `[sshd] enabled = true`，看 `journalctl -u fail2ban` |
| 自己被 fail2ban 封了 | 家宽 IP 变动，或 `IdentitiesOnly` 没设导致反复认证失败 | `fail2ban-client set sshd unbanip 你的IP`，把新 IP 加进 `ignoreip` |
| `su root` 报 `Authentication failure` | Ubuntu 默认 root 无密码（被锁定） | 用 `sudo`；确实要 `su` 就 `sudo passwd root`（不推荐） |
| 改端口后 SSH 全挂 | 忘了同步防火墙/安全组/fail2ban 的 port | 三处都要改；先在安全组加新端口，验证通了再删旧端口 |

---

## 十、命令速查表

| 目的 | 命令 |
|---|---|
| 生成密钥对 | `ssh-keygen -t ed25519 -C "备注"` |
| 上传公钥 | `ssh-copy-id -i ~/.ssh/id_ed25519.pub ops@IP` |
| 带指定私钥登录 | `ssh -i ~/.ssh/id_ed25519 ops@IP` |
| 校验 sshd 配置语法 | `sudo sshd -t` |
| 查看 sshd 实际生效配置 | `sudo sshd -T` |
| 重载 SSH 服务 | `sudo systemctl reload sshd` |
| 查看失败登录 | `sudo journalctl -u ssh --since today \| grep -i failed` |
| 查看成功登录 | `last -a \| head` |
| 统计攻击 IP | `sudo grep "Failed password" /var/log/auth.log \| awk '{print $(NF-3)}' \| sort \| uniq -c \| sort -nr \| head` |
| 查看 fail2ban 封禁 | `sudo fail2ban-client status sshd` |
| 手动解封 | `sudo fail2ban-client set sshd unbanip IP` |
| 检查权限 | `ls -ld /home/ops ~/.ssh ~/.ssh/authorized_keys` |

---

## 十一、完成后的最终状态

- ✅ root 无法远程登录（`PermitRootLogin no`）；
- ✅ 密码认证彻底关闭，只有密钥能进；
- ✅ 只有 `ops` 一个账号允许 SSH（`AllowUsers`）；
- ✅ `ops` 登录后用 `sudo` 提权到 root，操作有日志可审计；
- ✅ fail2ban 自动封禁反复失败的 IP；
- ✅ 私钥在本地、权限 600、带 passphrase；
- ✅ 云安全组 + 系统防火墙双层兜底；
- ✅ 有备份配置和控制台 VNC 作为逃生通道。

> 做完这套，登录日志里的失败记录会从"每天几万条"变成"零星几条被 fail2ban 秒封"。
> 记住：**安全性的来源是"用公钥替代口令"，不是"换端口"或"把密码改复杂"。**

