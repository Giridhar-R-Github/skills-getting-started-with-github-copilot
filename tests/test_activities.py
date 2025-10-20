from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    # ensure at least one activity exists
    assert len(data) > 0


def test_signup_and_remove_participant_flow():
    activity = "Test Club"
    email = "tester@example.com"

    # create a new activity in the in-memory store for testing
    activities[activity] = {
        "description": "A temporary test activity",
        "schedule": "Now",
        "max_participants": 5,
        "participants": []
    }

    # ensure the activity is present
    resp = client.get("/activities")
    assert resp.status_code == 200
    assert activity in resp.json()

    # signup happy path
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    assert resp.json().get("message")
    assert email in activities[activity]["participants"]

    # duplicate signup should fail
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 400

    # remove the participant
    resp = client.delete(f"/activities/{activity}/participants?email={email}")
    assert resp.status_code == 200
    assert email not in activities[activity]["participants"]

    # removing again should return 404
    resp = client.delete(f"/activities/{activity}/participants?email={email}")
    assert resp.status_code == 404

    # cleanup
    del activities[activity]