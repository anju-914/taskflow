from flask import Blueprint, jsonify, request, g
from services.auth_middleware import require_auth
from services.supabase_client import get_supabase

users_bp = Blueprint("users", __name__)

@users_bp.route("", methods=["GET"])
@require_auth
def list_users():
    sb = get_supabase()
    result = (
        sb.table("profiles")
        .select("id, full_name, email, avatar_url")
        .order("full_name")
        .execute()
    )
    return jsonify(result.data), 200

@users_bp.route("/me", methods=["GET"])
@require_auth
def get_me():
    sb = get_supabase()
    user_id = g.user["id"]
    result = (
        sb.table("profiles")
        .select("id, full_name, email, avatar_url, created_at")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(result.data), 200

@users_bp.route("/me", methods=["PATCH"])
@require_auth
def update_me():
    body = request.get_json(silent=True) or {}
    sb = get_supabase()
    user_id = g.user["id"]
    allowed = {"full_name", "avatar_url"}
    update_data = {k: v for k, v in body.items() if k in allowed}
    if not update_data:
        return jsonify({"error": "No valid fields provided"}), 400
    result = (
        sb.table("profiles")
        .update(update_data)
        .eq("id", user_id)
        .select("id, full_name, email, avatar_url")
        .single()
        .execute()
    )
    return jsonify(result.data), 200