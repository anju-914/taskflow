from flask import Blueprint, jsonify, g
from services.auth_middleware import require_auth
from services.supabase_client import get_supabase

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/sync-profile", methods=["POST"])
@require_auth
def sync_profile():
    sb = get_supabase()
    user = g.user
    user_id = user["id"]
    email = user.get("email", "")
    meta = user.get("user_metadata", {})

    profile_data = {
        "id": user_id,
        "email": email,
        "full_name": meta.get("full_name") or meta.get("name") or email.split("@")[0],
        "avatar_url": meta.get("avatar_url") or meta.get("picture"),
    }

    result = (
        sb.table("profiles")
        .upsert(profile_data, on_conflict="id")
        .select("id, full_name, email, avatar_url")
        .single()
        .execute()
    )
    return jsonify(result.data), 200

@auth_bp.route("/me", methods=["GET"])
@require_auth
def auth_me():
    return jsonify({
        "id": g.user["id"],
        "email": g.user.get("email"),
        "user_metadata": g.user.get("user_metadata", {}),
    }), 200