from ninja import NinjaAPI
from applications.api import router as applications_router

api = NinjaAPI(title="Workflow Tracker API", version="1.0.0")
api.add_router("/applications", applications_router)
