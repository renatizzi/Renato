from fastapi import FastAPI, APIRouter, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import io
import csv
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Default and master passwords
DEFAULT_PASSWORD = "archivio2025"
MASTER_PASSWORD = "masterreset2025"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class PasswordCheck(BaseModel):
    password: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class PasswordReset(BaseModel):
    master_password: str

class CategoryBase(BaseModel):
    name: str
    color: str = "#4A6741"

class Category(CategoryBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CategoryCreate(CategoryBase):
    pass

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = ""
    image_data: Optional[str] = ""  # Base64 image data

class Item(ItemBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ItemCreate(ItemBase):
    pass

class BoxBase(BaseModel):
    box_number: int
    name: str
    category_id: Optional[str] = None
    location: Optional[str] = ""

class Box(BoxBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[Item] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BoxCreate(BaseModel):
    name: str
    category_id: Optional[str] = None
    location: Optional[str] = ""

class BoxUpdate(BaseModel):
    box_number: Optional[int] = None
    name: Optional[str] = None
    category_id: Optional[str] = None
    location: Optional[str] = None

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_data: Optional[str] = None

class SearchResult(BaseModel):
    box_id: str
    box_number: int
    box_name: str
    item_id: str
    item_name: str
    item_description: str
    item_image_data: Optional[str] = None
    category_name: Optional[str] = None

# ==================== PASSWORD HELPERS ====================

async def get_app_password():
    """Get password from DB or return default"""
    settings = await db.settings.find_one({"key": "app_password"}, {"_id": 0})
    if settings:
        return settings.get("value", DEFAULT_PASSWORD)
    return DEFAULT_PASSWORD

async def set_app_password(new_password: str):
    """Set password in DB"""
    await db.settings.update_one(
        {"key": "app_password"},
        {"$set": {"key": "app_password", "value": new_password}},
        upsert=True
    )

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/verify")
async def verify_password(input: PasswordCheck):
    current_password = await get_app_password()
    if input.password == current_password:
        return {"success": True, "message": "Password corretta"}
    raise HTTPException(status_code=401, detail="Password errata")

@api_router.post("/auth/change-password")
async def change_password(input: PasswordChange):
    current_password = await get_app_password()
    if input.current_password != current_password:
        raise HTTPException(status_code=401, detail="Password attuale errata")
    if len(input.new_password) < 4:
        raise HTTPException(status_code=400, detail="La nuova password deve avere almeno 4 caratteri")
    await set_app_password(input.new_password)
    return {"success": True, "message": "Password modificata con successo"}

@api_router.post("/auth/reset-password")
async def reset_password(input: PasswordReset):
    if input.master_password != MASTER_PASSWORD:
        raise HTTPException(status_code=401, detail="Master password errata")
    await set_app_password(DEFAULT_PASSWORD)
    return {"success": True, "message": f"Password ripristinata a: {DEFAULT_PASSWORD}"}

# ==================== CATEGORY ROUTES ====================

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    for cat in categories:
        if isinstance(cat.get('created_at'), str):
            cat['created_at'] = datetime.fromisoformat(cat['created_at'])
    return categories

@api_router.post("/categories", response_model=Category)
async def create_category(input: CategoryCreate):
    category = Category(**input.model_dump())
    doc = category.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.categories.insert_one(doc)
    return category

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, input: CategoryCreate):
    existing = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Categoria non trovata")
    
    await db.categories.update_one(
        {"id": category_id},
        {"$set": {"name": input.name, "color": input.color}}
    )
    updated = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Categoria non trovata")
    await db.boxes.update_many(
        {"category_id": category_id},
        {"$set": {"category_id": None}}
    )
    return {"message": "Categoria eliminata"}

# ==================== BOX ROUTES ====================

async def get_next_box_number():
    last_box = await db.boxes.find_one(sort=[("box_number", -1)], projection={"box_number": 1, "_id": 0})
    return (last_box["box_number"] + 1) if last_box else 1

@api_router.get("/boxes", response_model=List[Box])
async def get_boxes(category_id: Optional[str] = None, location: Optional[str] = None):
    query = {}
    if category_id:
        query["category_id"] = category_id
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    boxes = await db.boxes.find(query, {"_id": 0}).sort("box_number", 1).to_list(1000)
    for box in boxes:
        if isinstance(box.get('created_at'), str):
            box['created_at'] = datetime.fromisoformat(box['created_at'])
        if isinstance(box.get('updated_at'), str):
            box['updated_at'] = datetime.fromisoformat(box['updated_at'])
        for item in box.get('items', []):
            if isinstance(item.get('created_at'), str):
                item['created_at'] = datetime.fromisoformat(item['created_at'])
    return boxes

@api_router.get("/boxes/locations")
async def get_locations():
    boxes = await db.boxes.find({}, {"_id": 0, "location": 1}).to_list(1000)
    locations = list(set(box.get('location', '') for box in boxes if box.get('location')))
    return sorted(locations)

@api_router.get("/boxes/{box_id}", response_model=Box)
async def get_box(box_id: str):
    box = await db.boxes.find_one({"id": box_id}, {"_id": 0})
    if not box:
        raise HTTPException(status_code=404, detail="Scatola non trovata")
    if isinstance(box.get('created_at'), str):
        box['created_at'] = datetime.fromisoformat(box['created_at'])
    if isinstance(box.get('updated_at'), str):
        box['updated_at'] = datetime.fromisoformat(box['updated_at'])
    for item in box.get('items', []):
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return box

@api_router.get("/boxes/by-number/{box_number}", response_model=Box)
async def get_box_by_number(box_number: int):
    box = await db.boxes.find_one({"box_number": box_number}, {"_id": 0})
    if not box:
        raise HTTPException(status_code=404, detail="Scatola non trovata")
    if isinstance(box.get('created_at'), str):
        box['created_at'] = datetime.fromisoformat(box['created_at'])
    if isinstance(box.get('updated_at'), str):
        box['updated_at'] = datetime.fromisoformat(box['updated_at'])
    for item in box.get('items', []):
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return box

@api_router.post("/boxes", response_model=Box)
async def create_box(input: BoxCreate):
    box_number = await get_next_box_number()
    box = Box(
        box_number=box_number,
        name=input.name,
        category_id=input.category_id,
        location=input.location or ""
    )
    doc = box.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    for item in doc.get('items', []):
        item['created_at'] = item['created_at'].isoformat()
    await db.boxes.insert_one(doc)
    return box

@api_router.put("/boxes/{box_id}", response_model=Box)
async def update_box(box_id: str, input: BoxUpdate):
    existing = await db.boxes.find_one({"id": box_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Scatola non trovata")
    
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    
    if "box_number" in update_data and update_data["box_number"] != existing["box_number"]:
        conflict = await db.boxes.find_one({"box_number": update_data["box_number"]})
        if conflict:
            raise HTTPException(status_code=400, detail="Numero scatola già esistente")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.boxes.update_one({"id": box_id}, {"$set": update_data})
    updated = await db.boxes.find_one({"id": box_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    for item in updated.get('items', []):
        if isinstance(item.get('created_at'), str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
    return updated

@api_router.delete("/boxes/{box_id}")
async def delete_box(box_id: str):
    result = await db.boxes.delete_one({"id": box_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Scatola non trovata")
    return {"message": "Scatola eliminata"}

# ==================== ITEM ROUTES ====================

@api_router.post("/boxes/{box_id}/items", response_model=Box)
async def add_item_to_box(box_id: str, input: ItemCreate):
    existing = await db.boxes.find_one({"id": box_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Scatola non trovata")
    
    item = Item(**input.model_dump())
    item_doc = item.model_dump()
    item_doc['created_at'] = item_doc['created_at'].isoformat()
    
    await db.boxes.update_one(
        {"id": box_id},
        {
            "$push": {"items": item_doc},
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    updated = await db.boxes.find_one({"id": box_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    for itm in updated.get('items', []):
        if isinstance(itm.get('created_at'), str):
            itm['created_at'] = datetime.fromisoformat(itm['created_at'])
    return updated

@api_router.put("/boxes/{box_id}/items/{item_id}", response_model=Box)
async def update_item(box_id: str, item_id: str, input: ItemUpdate):
    existing = await db.boxes.find_one({"id": box_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Scatola non trovata")
    
    items = existing.get('items', [])
    item_found = False
    for item in items:
        if item['id'] == item_id:
            if input.name is not None:
                item['name'] = input.name
            if input.description is not None:
                item['description'] = input.description
            if input.image_data is not None:
                item['image_data'] = input.image_data
            item_found = True
            break
    
    if not item_found:
        raise HTTPException(status_code=404, detail="Oggetto non trovato")
    
    await db.boxes.update_one(
        {"id": box_id},
        {
            "$set": {
                "items": items,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    updated = await db.boxes.find_one({"id": box_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    for itm in updated.get('items', []):
        if isinstance(itm.get('created_at'), str):
            itm['created_at'] = datetime.fromisoformat(itm['created_at'])
    return updated

@api_router.delete("/boxes/{box_id}/items/{item_id}", response_model=Box)
async def delete_item(box_id: str, item_id: str):
    existing = await db.boxes.find_one({"id": box_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Scatola non trovata")
    
    items = [item for item in existing.get('items', []) if item['id'] != item_id]
    
    await db.boxes.update_one(
        {"id": box_id},
        {
            "$set": {
                "items": items,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    updated = await db.boxes.find_one({"id": box_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    for itm in updated.get('items', []):
        if isinstance(itm.get('created_at'), str):
            itm['created_at'] = datetime.fromisoformat(itm['created_at'])
    return updated

# ==================== SEARCH ROUTES ====================

@api_router.get("/search", response_model=List[SearchResult])
async def search_items(q: str = Query(..., min_length=1)):
    boxes = await db.boxes.find({}, {"_id": 0}).to_list(1000)
    categories = {cat['id']: cat['name'] for cat in await db.categories.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(1000)}
    
    results = []
    search_term = q.lower()
    
    for box in boxes:
        for item in box.get('items', []):
            item_name = item.get('name', '').lower()
            item_desc = item.get('description', '').lower()
            
            if search_term in item_name or search_term in item_desc:
                results.append(SearchResult(
                    box_id=box['id'],
                    box_number=box['box_number'],
                    box_name=box['name'],
                    item_id=item['id'],
                    item_name=item['name'],
                    item_description=item.get('description', ''),
                    item_image_data=item.get('image_data', ''),
                    category_name=categories.get(box.get('category_id'))
                ))
    
    return results

# ==================== STATS ROUTE ====================

@api_router.get("/stats")
async def get_stats():
    boxes = await db.boxes.find({}, {"_id": 0}).to_list(1000)
    categories = await db.categories.count_documents({})
    
    total_boxes = len(boxes)
    total_items = sum(len(box.get('items', [])) for box in boxes)
    
    return {
        "total_boxes": total_boxes,
        "total_items": total_items,
        "total_categories": categories
    }

# ==================== EXPORT ROUTES ====================

@api_router.get("/export/csv")
async def export_csv(box_ids: Optional[str] = None):
    query = {}
    if box_ids:
        ids_list = box_ids.split(",")
        query["id"] = {"$in": ids_list}
    
    boxes = await db.boxes.find(query, {"_id": 0}).sort("box_number", 1).to_list(1000)
    categories = {cat['id']: cat['name'] for cat in await db.categories.find({}, {"_id": 0, "id": 1, "name": 1}).to_list(1000)}
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Numero Contenitore", "Nome Contenitore", "Categoria", "Posizione", "Nome Oggetto", "Descrizione", "Data Inserimento"])
    
    for box in boxes:
        category_name = categories.get(box.get('category_id'), "")
        if not box.get('items'):
            writer.writerow([
                box['box_number'],
                box['name'],
                category_name,
                box.get('location', ''),
                "",
                "",
                box.get('created_at', '')
            ])
        else:
            for item in box.get('items', []):
                writer.writerow([
                    box['box_number'],
                    box['name'],
                    category_name,
                    box.get('location', ''),
                    item['name'],
                    item.get('description', ''),
                    item.get('created_at', '')
                ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=archivio_oggetti.csv"}
    )

# ==================== BACKUP/RESTORE ROUTES ====================

@api_router.get("/backup")
async def backup_data():
    """Export all data as JSON backup"""
    boxes = await db.boxes.find({}, {"_id": 0}).to_list(10000)
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    
    backup_data = {
        "version": "1.0",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "categories": categories,
        "boxes": boxes
    }
    
    json_str = json.dumps(backup_data, indent=2, ensure_ascii=False, default=str)
    
    return StreamingResponse(
        iter([json_str]),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=archivio_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"}
    )

@api_router.post("/restore")
async def restore_data(file: UploadFile = File(...)):
    """Restore data from JSON backup"""
    try:
        content = await file.read()
        backup_data = json.loads(content.decode('utf-8'))
        
        if "categories" not in backup_data or "boxes" not in backup_data:
            raise HTTPException(status_code=400, detail="Formato backup non valido")
        
        # Clear existing data
        await db.categories.delete_many({})
        await db.boxes.delete_many({})
        
        # Restore categories
        if backup_data["categories"]:
            await db.categories.insert_many(backup_data["categories"])
        
        # Restore boxes
        if backup_data["boxes"]:
            await db.boxes.insert_many(backup_data["boxes"])
        
        return {
            "success": True,
            "message": "Ripristino completato",
            "restored": {
                "categories": len(backup_data["categories"]),
                "boxes": len(backup_data["boxes"])
            }
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="File JSON non valido")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nel ripristino: {str(e)}")

# ==================== ROOT ROUTE ====================

@api_router.get("/")
async def root():
    return {"message": "Archivio Oggetti Personali API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
