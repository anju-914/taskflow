import os
from flask import Blueprint, request, jsonify, g
from services.auth_middleware import require_auth
from services.supabase_client import get_supabase
from services.email_service import send_task_created_email, send_task_completed_email

tasks_bp = Blueprint("tasks", __name__)
APP_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


@tasks_bp.route("", methods=["GET"])
@require_auth
def list_tasks():
    sb = get_supabase()
    result = (
        sb.table("tasks")
        .select(
            "*, "
            "creator:profiles!tasks_created_by_fkey(id, full_name, email, avatar_url), "
            "assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url)"
        )
        .order("created_at", desc=True)
        .execute()
    )
    return jsonify(result.data), 200


@tasks_bp.route("", methods=["POST"])
@require_auth
def create_task():
    body = request.get_json(silent=True) or {}
    title = (body.get("title") or "").strip()
    if not title:
        return jsonify({"error": "title is required"}), 400

    sb = get_supabase()
    user_id = g.user["id"]

    new_task = {
        "title": title,
        "description": body.get("description"),
        "priority": body.get("priority", "medium"),
        "status": "pending",
        "created_by": user_id,
        "assigned_to": body.get("assigned_to"),
        "due_date": body.get("due_date"),
    }

    result = (
        sb.table("tasks")
        .insert(new_task)
        .select(
            "*, "
            "creator:profiles!tasks_created_by_fkey(id, full_name, email, avatar_url), "
            "assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url)"
        )
        .single()
        .execute()
    )

    task = result.data
    assignee = task.get("assignee")
    creator = task.get("creator")

    if assignee and assignee.get("email"):
        send_task_created_email(
            assignee_email=assignee["email"],
            assignee_name=assignee.get("full_name") or assignee["email"],
            task_title=task["title"],
            task_description=task.get("description") or "",
            creator_name=creator.get("full_name") or creator["email"] if creator else "Someone",
            due_date=task.get("due_date"),
            app_url=APP_URL,
        )
    return jsonify(task), 201


@tasks_bp.route("/<task_id>", methods=["PATCH"])
@require_auth
def update_task(task_id: str):
    body = request.get_json(silent=True) or {}
    sb = get_supabase()

    current_result = (
        sb.table("tasks")
        .select(
            "*, "
            "creator:profiles!tasks_created_by_fkey(id, full_name, email, avatar_url), "
            "assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url)"
        )
        .eq("id", task_id)
        .single()
        .execute()
    )

    if not current_result.data:
        return jsonify({"error": "Task not found"}), 404

    current = current_result.data
    user_id = g.user["id"]

    if current["created_by"] != user_id and current.get("assigned_to") != user_id:
        return jsonify({"error": "Forbidden"}), 403

    allowed_fields = {"title", "description", "status", "priority", "due_date", "assigned_to"}
    update_data = {k: v for k, v in body.items() if k in allowed_fields}

    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    result = (
        sb.table("tasks")
        .update(update_data)
        .eq("id", task_id)
        .select(
            "*, "
            "creator:profiles!tasks_created_by_fkey(id, full_name, email, avatar_url), "
            "assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url)"
        )
        .single()
        .execute()
    )

    updated = result.data
    new_status = update_data.get("status")
    if new_status == "completed" and current["status"] != "completed":
        creator = updated.get("creator")
        completer_name = g.user.get("user_metadata", {}).get("full_name") or g.user.get("email", "A team member")
        if creator and creator.get("email"):
            send_task_completed_email(
                creator_email=creator["email"],
                creator_name=creator.get("full_name") or creator["email"],
                task_title=updated["title"],
                completer_name=completer_name,
                app_url=APP_URL,
            )
    return jsonify(updated), 200


@tasks_bp.route("/<task_id>", methods=["DELETE"])
@require_auth
def delete_task(task_id: str):
    sb = get_supabase()
    user_id = g.user["id"]
    check = (
        sb.table("tasks")
        .select("created_by")
        .eq("id", task_id)
        .single()
        .execute()
    )
    if not check.data:
        return jsonify({"error": "Task not found"}), 404
    if check.data["created_by"] != user_id:
        return jsonify({"error": "Only the creator can delete this task"}), 403
    sb.table("tasks").delete().eq("id", task_id).execute()
    return jsonify({"message": "Task deleted"}), 200