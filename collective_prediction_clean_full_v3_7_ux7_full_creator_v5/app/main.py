from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import Dict, Any
import time, hashlib, random, math

INCOME_PERIOD = 300  # 5 минут
INCOME_AMOUNT = 50

app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

STATE: Dict[str, Any] = {
    "users": {},        # username -> {"coins": int, "password": str(hash), "gender": str, "appearance": dict}
    "online": set(),
    "shop": [
        {"id": 1, "name": "Шляпа мага", "type": "head", "price": 200},
        {"id": 2, "name": "Жилетка", "type": "upper", "price": 150},
        {"id": 3, "name": "Брюки", "type": "lower", "price": 150},
        {"id": 4, "name": "Плащ", "type": "cloak", "price": 250},
        {"id": 5, "name": "Ботинки", "type": "shoes", "price": 120},
        {"id": 6, "name": "Амулет", "type": "accessory", "price": 300},
        {"id": 7, "name": "Шляпа исследователя", "type": "head", "price": 180},
        {"id": 8, "name": "Кепка пилота", "type": "head", "price": 220},
        {"id": 9, "name": "Куртка авантюриста", "type": "upper", "price": 260},
        {"id": 10, "name": "Мантия звёздочёта", "type": "upper", "price": 320},
        {"id": 11, "name": "Штаны следопыта", "type": "lower", "price": 210},
        {"id": 12, "name": "Бриджи ветра", "type": "lower", "price": 190},
        {"id": 13, "name": "Ботинки странника", "type": "shoes", "price": 170},
        {"id": 14, "name": "Сапоги грома", "type": "shoes", "price": 280},
        {"id": 15, "name": "Амулет рассвета", "type": "accessory", "price": 330},
        {"id": 16, "name": "Кольцо удачи", "type": "accessory", "price": 260},
    ],
    "inv": {},
    "last_income": {},
    "positions": {},
}

DEFAULT_INV = [
    {"id": 1001, "name": "Простая шляпа", "type": "head", "equipped": False},
    {"id": 1002, "name": "Простая рубашка", "type": "upper", "equipped": True},
    {"id": 1003, "name": "Простые штаны", "type": "lower", "equipped": True},
    {"id": 1004, "name": "Простые ботинки", "type": "shoes", "equipped": False},
]

def sha(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()

EMOTIONS = ["smile", "neutral", "frown", "surprised", "sleepy"]


def random_appearance():
    skins = ["#f1d3b3", "#d6a77a", "#b07b53", "#855739"]
    hairs = ["#2b2b2b", "#5a3a1c", "#d7b36d", "#7d553a", "#c7a27a"]
    eyes = ["#2b4c7e", "#5c3b8c", "#2f6b3c", "#1e1e1e"]
    return {
        "skin": random.choice(skins),
        "hair": random.choice(hairs),
        "eyes": random.choice(eyes),
        "style": "short",
        "emotion": random.choice(EMOTIONS),
    }

def ensure_user(u: str, gender: str = "other", appearance: dict | None = None):
    if u not in STATE["users"]:
        if gender == "other" and (appearance is None):
            # для неопределившихся — рандом
            appearance = random_appearance()
        base_appearance = appearance or random_appearance()
        base_appearance.setdefault("emotion", random.choice(EMOTIONS))
        STATE["users"][u] = {
            "coins": 500,
            "password": "",
            "gender": gender,
            "appearance": base_appearance,
        }
        STATE["inv"][u] = [dict(x) for x in DEFAULT_INV]
        STATE["positions"][u] = {"x": 520, "y": 340}
        STATE["last_income"][u] = time.time()


def apply_passive_income(username: str) -> bool:
    """Начисляет пассивный доход за завершённые циклы.

    Возвращает True, если монеты были начислены.
    """
    ensure_user(username)
    now = time.time()
    last = STATE["last_income"].get(username)
    if last is None:
        STATE["last_income"][username] = now
        return False

    elapsed = now - last
    if elapsed < INCOME_PERIOD:
        return False

    cycles = int(elapsed // INCOME_PERIOD)
    if cycles <= 0:
        return False

    STATE["users"][username]["coins"] += cycles * INCOME_AMOUNT
    STATE["last_income"][username] = last + cycles * INCOME_PERIOD
    return True

def current_slots(u: str):
    equip = {}
    for it in STATE["inv"][u]:
        if it.get("equipped"):
            equip[it["type"]] = True
    return equip

@app.get("/", response_class=HTMLResponse)
async def index(request: Request, username: str | None = None):
    if not username:
        return RedirectResponse(url="/auth")
    ensure_user(username)
    return templates.TemplateResponse("location.html", {"request": request, "username": username})

# --- AUTH ---
@app.get("/auth", response_class=HTMLResponse)
async def auth_page(request: Request):
    return templates.TemplateResponse("auth.html", {"request": request})

@app.post("/api/register")
async def api_register(
    username: str = Form(...),
    password: str = Form(...),
    gender: str = Form("other"),
    skin: str = Form(None),
    hair: str = Form(None),
    eyes: str = Form(None),
    style: str = Form("short"),
    emotion: str = Form("smile"),
):
    username = (username or "").strip()
    if not username or len(username) < 3:
        return {"ok": False, "error": "Имя слишком короткое"}
    if len(password or "") < 6:
        return {"ok": False, "error": "Пароль слишком короткий"}
    if username in STATE["users"] and STATE["users"][username].get("password"):
        return {"ok": False, "error": "Пользователь уже существует"}

    if emotion not in EMOTIONS:
        emotion = "smile"

    appearance = {
        "skin": skin or "#f1d3b3",
        "hair": hair or "#2b2b2b",
        "eyes": eyes or "#2b4c7e",
        "style": style or "short",
        "emotion": emotion,
    }
    ensure_user(username, gender, appearance)
    STATE["users"][username]["password"] = sha(password)
    STATE["users"][username]["gender"] = gender
    STATE["users"][username]["appearance"] = appearance
    return {"ok": True, "username": username, "gender": gender, "appearance": appearance}

@app.post("/api/login")
async def api_login(username: str = Form(...), password: str = Form(...)):
    username = (username or "").strip()
    if username not in STATE["users"]:
        return {"ok": False, "error": "Пользователь не найден"}
    if STATE["users"][username].get("password") != sha(password or ""):
        return {"ok": False, "error": "Неверный пароль"}
    return {"ok": True, "username": username, "gender": STATE["users"][username].get("gender", "other"),
            "appearance": STATE["users"][username].get("appearance")}

# --- GAME API ---
@app.get("/api/me")
async def me(username: str):
    ensure_user(username)
    apply_passive_income(username)
    return {"username": username, "coins": STATE["users"][username]["coins"]}

@app.get("/api/appearance")
async def get_appearance(username: str):
    ensure_user(username)
    return STATE["users"][username].get("appearance", {})

@app.post("/api/appearance/save")
async def save_appearance(
    username: str = Form(...),
    skin: str = Form(...),
    hair: str = Form(...),
    eyes: str = Form(...),
    style: str = Form(...),
    emotion: str = Form("smile"),
):
    ensure_user(username)
    if emotion not in EMOTIONS:
        emotion = "smile"
    STATE["users"][username]["appearance"] = {
        "skin": skin,
        "hair": hair,
        "eyes": eyes,
        "style": style,
        "emotion": emotion,
    }
    # оповестим всех, чтобы обновили визуал
    await broadcast({"type":"appearance","name":username,"appearance":STATE["users"][username]["appearance"]})
    return {"ok": True}

@app.get("/api/income_left")
async def income_left(username: str):
    ensure_user(username)
    granted = apply_passive_income(username)
    now = time.time()
    last = STATE["last_income"].get(username, now)
    left = max(0, math.ceil(INCOME_PERIOD - (now - last)))
    return {"left": left, "period": INCOME_PERIOD, "amount": INCOME_AMOUNT, "granted": granted}

@app.post("/api/claim_income")
async def claim_income(username: str = Form(...)):
    ensure_user(username)
    granted = apply_passive_income(username)
    if granted:
        await broadcast({"type": "coins", "name": username})
    now = time.time()
    last = STATE["last_income"].get(username, now)
    left = max(0, math.ceil(INCOME_PERIOD - (now - last)))
    return {"ok": True, "granted": granted, "left": left, "coins": STATE["users"][username]["coins"]}

@app.get("/api/shop")
async def api_shop():
    return {"items": STATE["shop"]}

@app.post("/api/buy")
async def api_buy(username: str = Form(...), item_id: int = Form(...)):
    ensure_user(username)
    apply_passive_income(username)
    item = next((x for x in STATE["shop"] if x["id"] == int(item_id)), None)
    if not item:
        return {"ok": False, "error": "Товар не найден"}
    if STATE["users"][username]["coins"] < item["price"]:
        return {"ok": False, "error": "Недостаточно монет"}
    STATE["users"][username]["coins"] -= item["price"]
    new_id = int(time.time() * 1000) % 10000000
    STATE["inv"][username].append({"id": new_id, "name": item["name"], "type": item["type"], "equipped": False})
    return {"ok": True}

@app.get("/api/inventory")
async def api_inventory(username: str):
    ensure_user(username)
    return STATE["inv"][username]

@app.post("/api/toggle_equip")
async def api_toggle(username: str = Form(...), item_id: int = Form(...)):
    ensure_user(username)
    inv = STATE["inv"][username]
    target = next((i for i in inv if i["id"] == int(item_id)), None)
    if not target:
        return {"ok": False, "error": "Нет предмета"}
    t = target["type"]
    if not target["equipped"]:
        for it in inv:
            if it["type"] == t:
                it["equipped"] = False
        target["equipped"] = True
    else:
        target["equipped"] = False
    await broadcast({"type":"state","name":username,"equip":current_slots(username)})
    return {"ok": True}

@app.get("/api/avatar_state")
async def api_avatar(username: str):
    ensure_user(username)
    return {
        "slots": current_slots(username),
        "appearance": STATE["users"][username].get("appearance", {}),
        "gender": STATE["users"][username].get("gender", "other"),
    }

@app.get("/api/online")
async def api_online():
    return {"users": sorted(list(STATE["online"]))}

# --- WebSocket ---
clients: Dict[str, WebSocket] = {}

async def broadcast(payload: dict):
    dead = []
    for name, ws in list(clients.items()):
        try:
            await ws.send_json(payload)
        except Exception:
            dead.append(name)
    for n in dead:
        clients.pop(n, None)
        STATE["online"].discard(n)

@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()
    username = None
    try:
        while True:
            data = await ws.receive_json()
            t = data.get("type")
            if t == "presence":
                username = data.get("name") or "Гость"
                ensure_user(username)
                clients[username] = ws
                STATE["online"].add(username)
                pos = STATE["positions"].get(username, {"x":520,"y":340})
                await ws.send_json({
                    "type":"snapshot",
                    "me": {"name": username, "x": pos["x"], "y": pos["y"],
                           "equip": current_slots(username),
                           "appearance": STATE["users"][username].get("appearance"),
                           "gender": STATE["users"].get(username, {}).get("gender", "other")},
                    "players":[
                        {"name": n,
                         "x": STATE["positions"].get(n,{"x":520,"y":340})["x"],
                         "y": STATE["positions"].get(n,{"x":520,"y":340})["y"],
                         "equip": current_slots(n),
                         "appearance": STATE["users"][n].get("appearance"),
                         "gender": STATE["users"].get(n, {}).get("gender", "other")}
                        for n in STATE["online"] if n != username
                    ]
                })
                await broadcast({"type":"system","text":f"{username} подключился"})
            elif t == "chat":
                await broadcast({"type":"chat","name":data["name"],"msg":data["msg"]})
            elif t == "move":
                nm = data["name"]
                STATE["positions"][nm] = {"x": int(data.get("x",520)), "y": int(data.get("y",340))}
                await broadcast({"type":"move","name":nm,"x":STATE["positions"][nm]["x"],"y":STATE["positions"][nm]["y"]})
            elif t == "state":
                nm = data["name"]
                # persist appearance if provided
                if "appearance" in data:
                    STATE["users"].setdefault(nm,{}).setdefault("appearance",{}).update(data.get("appearance",{}))
                await broadcast({
                    "type":"state",
                    "name":nm,
                    "equip":data.get("equip",{}),
                    "appearance":STATE["users"].get(nm,{}).get("appearance",{}),
                    "gender": STATE["users"].get(nm, {}).get("gender", "other")
                })
            elif t == "appearance":
                nm = data["name"]
                STATE["users"][nm]["appearance"] = data.get("appearance", STATE["users"][nm].get("appearance"))
                await broadcast({
                    "type":"appearance",
                    "name":nm,
                    "appearance":STATE["users"][nm]["appearance"],
                    "gender": STATE["users"].get(nm, {}).get("gender", "other")
                })
    except WebSocketDisconnect:
        pass
    finally:
        if username:
            clients.pop(username, None)
            STATE["online"].discard(username)
            try:
                await broadcast({"type":"system","text":f"{username} вышел"})
            except Exception:
                pass
