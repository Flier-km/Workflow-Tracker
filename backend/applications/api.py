from django.utils import timezone
from ninja import Router
from ninja.errors import HttpError
from typing import List

from .models import Application, ApplicationStatus, ApplicationType
from .schemas import (
    ApplicationCreateSchema,
    ApplicationUpdateSchema,
    ApplicationOutSchema,
    ApplicationListSchema,
    ReviewerDecisionSchema,
    ErrorSchema,
)

router = Router()

VALID_APPLICATION_TYPES = [choice[0] for choice in ApplicationType.choices]
REVIEWER_DECISIONS = [
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.NEED_MORE_INFORMATION,
]


@router.post("/", response={201: ApplicationOutSchema}, tags=["Applications"])
def create_application(request, payload: ApplicationCreateSchema):
    """Create a new application in Draft status."""
    if payload.application_type not in VALID_APPLICATION_TYPES:
        raise HttpError(400, f"Invalid application_type. Choose from: {VALID_APPLICATION_TYPES}")
    app = Application.objects.create(**payload.dict())
    return 201, app


@router.get("/", response=List[ApplicationListSchema], tags=["Applications"])
def list_applications(request, status: str = None):
    """List all applications, optionally filtered by status."""
    qs = Application.objects.all()
    if status:
        qs = qs.filter(status=status)
    return qs


@router.get("/{app_id}", response={200: ApplicationOutSchema, 404: ErrorSchema}, tags=["Applications"])
def get_application(request, app_id: int):
    """Get application details by ID."""
    try:
        return Application.objects.get(id=app_id)
    except Application.DoesNotExist:
        raise HttpError(404, "Application not found")


@router.put("/{app_id}", response={200: ApplicationOutSchema, 400: ErrorSchema, 404: ErrorSchema}, tags=["Applications"])
def update_application(request, app_id: int, payload: ApplicationUpdateSchema):
    """Update a Draft or Need More Information application."""
    try:
        app = Application.objects.get(id=app_id)
    except Application.DoesNotExist:
        raise HttpError(404, "Application not found")

    if app.status not in [ApplicationStatus.DRAFT, ApplicationStatus.NEED_MORE_INFORMATION]:
        raise HttpError(400, f"Only Draft or Need More Information applications can be edited. Current status: {app.status}")

    data = payload.dict(exclude_unset=True)
    if "application_type" in data and data["application_type"] not in VALID_APPLICATION_TYPES:
        raise HttpError(400, f"Invalid application_type. Choose from: {VALID_APPLICATION_TYPES}")

    for attr, value in data.items():
        setattr(app, attr, value)
    app.save()
    return app


@router.post("/{app_id}/submit", response={200: ApplicationOutSchema, 400: ErrorSchema, 404: ErrorSchema}, tags=["Workflow"])
def submit_application(request, app_id: int):
    """Submit a Draft application."""
    try:
        app = Application.objects.get(id=app_id)
    except Application.DoesNotExist:
        raise HttpError(404, "Application not found")

    if app.status != ApplicationStatus.DRAFT and app.status != ApplicationStatus.NEED_MORE_INFORMATION:
        raise HttpError(400, f"Only Draft or Need More Information applications can be submitted. Current status: {app.status}")

    app.status = ApplicationStatus.SUBMITTED
    app.submitted_at = timezone.now()
    app.save()
    return app


@router.post("/{app_id}/start-review", response={200: ApplicationOutSchema, 400: ErrorSchema, 404: ErrorSchema}, tags=["Workflow"])
def start_review(request, app_id: int):
    """Move a Submitted application to Under Review."""
    try:
        app = Application.objects.get(id=app_id)
    except Application.DoesNotExist:
        raise HttpError(404, "Application not found")

    if app.status != ApplicationStatus.SUBMITTED:
        raise HttpError(400, f"Only Submitted applications can move to Under Review. Current status: {app.status}")

    app.status = ApplicationStatus.UNDER_REVIEW
    app.save()
    return app


@router.post("/{app_id}/decision", response={200: ApplicationOutSchema, 400: ErrorSchema, 404: ErrorSchema}, tags=["Workflow"])
def record_decision(request, app_id: int, payload: ReviewerDecisionSchema):
    """Record a reviewer decision for an Under Review application."""
    try:
        app = Application.objects.get(id=app_id)
    except Application.DoesNotExist:
        raise HttpError(404, "Application not found")

    if app.status != ApplicationStatus.UNDER_REVIEW:
        raise HttpError(400, f"Only Under Review applications can receive a decision. Current status: {app.status}")

    if payload.decision not in REVIEWER_DECISIONS:
        raise HttpError(400, f"Invalid decision. Choose from: {REVIEWER_DECISIONS}")

    if payload.decision in [ApplicationStatus.REJECTED, ApplicationStatus.NEED_MORE_INFORMATION]:
        if not payload.reviewer_comment.strip():
            raise HttpError(400, "A reviewer comment is required for Rejected or Need More Information decisions.")

    app.status = payload.decision
    app.reviewer_comment = payload.reviewer_comment
    app.reviewed_at = timezone.now()
    app.save()
    return app
