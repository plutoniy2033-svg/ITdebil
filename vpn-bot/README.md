# VPN Monitor Bot — установка на Ubuntu VPS

Бот [@VPNsasoring_bot](https://t.me/VPNsasoring_bot): команды `/status` и `/reboot` для VLESS (Xray) и Hysteria.

## Перед установкой (Telegram)

1. Добавьте @VPNsasoring_bot в группу.
2. В [@BotFather](https://t.me/BotFather) → `/mybots` → VPNsasoring → **Group Privacy** → **Turn off**.

## Шаг 0. Проверить имена сервисов на VPS

```bash
systemctl list-units --type=service --state=running | grep -iE 'xray|hysteria|v2ray'
```

Если hysteria называется `hysteria-server` — поменяйте `HYSTERIA_SERVICE` в `.env`.

## Шаг 1. Скопировать файлы на сервер

С вашего ПК (PowerShell), из папки `ITdebil`:

```powershell
scp -r vpn-bot/* user@YOUR_VPS_IP:/opt/vpn-bot/
```

Или вручную через Termius: создайте `/opt/vpn-bot` и вставьте содержимое файлов.

## Шаг 2. Установка на VPS (Termius)

```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv

sudo mkdir -p /opt/vpn-bot
sudo chown $USER:$USER /opt/vpn-bot
cd /opt/vpn-bot

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
nano .env   # вставьте BOT_TOKEN, проверьте ID и имена сервисов
chmod 600 .env
```

Пример `.env`:

```
BOT_TOKEN=ваш_токен
ALLOWED_USER_ID=812589199
ALLOWED_CHAT_IDS=812589199,-1003810414955
XRAY_SERVICE=xray
HYSTERIA_SERVICE=hysteria
```

## Шаг 3. Sudo для перезапуска VPN

```bash
# Замените YOUR_LINUX_USER на результат команды whoami
sudo sed "s/YOUR_LINUX_USER/$(whoami)/" sudoers.vpn-bot | sudo tee /etc/sudoers.d/vpn-bot
sudo chmod 440 /etc/sudoers.d/vpn-bot
```

## Шаг 4. Systemd-сервис

```bash
sudo sed "s/YOUR_LINUX_USER/$(whoami)/" vpn-bot.service | sudo tee /etc/systemd/system/vpn-bot.service
sudo systemctl daemon-reload
sudo systemctl enable vpn-bot
sudo systemctl start vpn-bot
sudo systemctl status vpn-bot --no-pager
```

## Шаг 5. Проверка

В Telegram (личка или группа): `/start`, `/status`, `/reboot`.

Логи при ошибках:

```bash
journalctl -u vpn-bot -f
```

## Файлы

| Файл | Назначение |
|------|------------|
| `bot.py` | Код бота |
| `.env.example` | Шаблон настроек (токен не коммитить) |
| `requirements.txt` | Python-зависимости |
| `vpn-bot.service` | Unit systemd |
| `sudoers.vpn-bot` | Права на systemctl для VPN |
