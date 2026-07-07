#!/usr/bin/env python3
import os
import subprocess
import time
from datetime import timedelta

import psutil
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = os.environ["BOT_TOKEN"]
ALLOWED_USER_ID = int(os.environ["ALLOWED_USER_ID"])
ALLOWED_CHAT_IDS = {
    int(chat_id.strip())
    for chat_id in os.environ.get("ALLOWED_CHAT_IDS", "").split(",")
    if chat_id.strip()
}
XRAY_SERVICE = os.environ.get("XRAY_SERVICE", "xray")
HYSTERIA_SERVICE = os.environ.get("HYSTERIA_SERVICE", "hysteria")


def is_authorized(update: Update) -> bool:
    user = update.effective_user
    chat = update.effective_chat
    if user is None or chat is None:
        return False
    if user.id != ALLOWED_USER_ID:
        return False
    if ALLOWED_CHAT_IDS and chat.id not in ALLOWED_CHAT_IDS:
        return False
    return True


def run_systemctl(*args: str) -> tuple[bool, str]:
    cmd = ["sudo", "systemctl", *args]
    result = subprocess.run(cmd, capture_output=True, text=True)
    output = (result.stdout or result.stderr or "").strip()
    return result.returncode == 0, output


def service_status(service: str) -> str:
    ok, output = run_systemctl("is-active", service)
    return output if output else ("active" if ok else "inactive")


def format_uptime() -> str:
    uptime = timedelta(seconds=int(time.time() - psutil.boot_time()))
    days = uptime.days
    hours, remainder = divmod(uptime.seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    return f"{days}d {hours}h {minutes}m"


def collect_status() -> str:
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    load1, load5, load15 = os.getloadavg()

    xray = service_status(XRAY_SERVICE)
    hysteria = service_status(HYSTERIA_SERVICE)

    return (
        "📊 <b>Статус сервера</b>\n\n"
        f"CPU: {cpu_percent:.1f}%\n"
        f"Load: {load1:.2f} / {load5:.2f} / {load15:.2f}\n"
        f"RAM: {memory.percent:.1f}% "
        f"({memory.used // (1024 ** 3)}G / {memory.total // (1024 ** 3)}G)\n"
        f"Disk: {disk.percent:.1f}% "
        f"({disk.used // (1024 ** 3)}G / {disk.total // (1024 ** 3)}G)\n"
        f"Uptime: {format_uptime()}\n\n"
        f"🔐 <b>VPN</b>\n"
        f"Xray ({XRAY_SERVICE}): <b>{xray}</b>\n"
        f"Hysteria ({HYSTERIA_SERVICE}): <b>{hysteria}</b>"
    )


async def unauthorized(update: Update) -> None:
    if update.message:
        await update.message.reply_text("⛔ Доступ запрещён.")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_authorized(update):
        await unauthorized(update)
        return
    await update.message.reply_text(
        "🤖 <b>VPN Monitor</b>\n\n"
        "/status — нагрузка и состояние VPN\n"
        "/reboot — перезапуск Xray и Hysteria",
        parse_mode="HTML",
    )


async def status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_authorized(update):
        await unauthorized(update)
        return
    await update.message.reply_text(collect_status(), parse_mode="HTML")


async def reboot(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not is_authorized(update):
        await unauthorized(update)
        return

    await update.message.reply_text("🔄 Перезапускаю VPN...")

    errors = []
    for service in (XRAY_SERVICE, HYSTERIA_SERVICE):
        ok, output = run_systemctl("restart", service)
        if not ok:
            errors.append(f"{service}: {output or 'ошибка'}")

    if errors:
        await update.message.reply_text(
            "❌ Ошибка перезапуска:\n" + "\n".join(errors),
            parse_mode="HTML",
        )
        return

    await update.message.reply_text(
        "✅ VPN перезапущен.\n\n" + collect_status(),
        parse_mode="HTML",
    )


def main() -> None:
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("status", status))
    app.add_handler(CommandHandler("reboot", reboot))
    app.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
