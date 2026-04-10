import pytest


class TestSignupForActivity:
    """Test suite for signup endpoint - using AAA (Arrange-Act-Assert) pattern"""

    def test_signup_new_participant_success(self, client, mock_activities):
        """Test successful signup of a new participant to an activity"""
        # Arrange
        activity_name = "Chess Club"
        email = "newstudent@mergington.edu"

        # Act
        response = client.post(
            f"/activities/{activity_name}/signup",
            params={"email": email}
        )

        # Assert
        assert response.status_code == 200
        assert email in mock_activities[activity_name]["participants"]
        assert response.json()["message"] == f"Signed up {email} for {activity_name}"

    def test_signup_duplicate_participant_fails(self, client, mock_activities):
        """Test signup fails when student is already registered for the activity"""
        # Arrange
        activity_name = "Chess Club"
        email = "michael@mergington.edu"  # Already registered

        # Act
        response = client.post(
            f"/activities/{activity_name}/signup",
            params={"email": email}
        )

        # Assert
        assert response.status_code == 400
        assert response.json()["detail"] == "Student already signed up for this activity"
        # Verify participant list is unchanged
        assert mock_activities[activity_name]["participants"].count(email) == 1

    def test_signup_nonexistent_activity_fails(self, client, mock_activities):
        """Test signup fails when activity does not exist"""
        # Arrange
        activity_name = "Nonexistent Club"
        email = "student@mergington.edu"

        # Act
        response = client.post(
            f"/activities/{activity_name}/signup",
            params={"email": email}
        )

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Activity not found"


class TestUnregisterFromActivity:
    """Test suite for unregister endpoint - using AAA (Arrange-Act-Assert) pattern"""

    def test_unregister_participant_success(self, client, mock_activities):
        """Test successful unregister of a participant from an activity"""
        # Arrange
        activity_name = "Chess Club"
        email = "michael@mergington.edu"
        initial_count = len(mock_activities[activity_name]["participants"])

        # Act
        response = client.delete(
            f"/activities/{activity_name}/participants/{email}"
        )

        # Assert
        assert response.status_code == 200
        assert email not in mock_activities[activity_name]["participants"]
        assert len(mock_activities[activity_name]["participants"]) == initial_count - 1
        assert response.json()["message"] == f"Unregistered {email} from {activity_name}"

    def test_unregister_nonexistent_participant_fails(self, client, mock_activities):
        """Test unregister fails when participant is not registered for the activity"""
        # Arrange
        activity_name = "Chess Club"
        email = "notregistered@mergington.edu"

        # Act
        response = client.delete(
            f"/activities/{activity_name}/participants/{email}"
        )

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Student not signed up for this activity"

    def test_unregister_nonexistent_activity_fails(self, client, mock_activities):
        """Test unregister fails when activity does not exist"""
        # Arrange
        activity_name = "Nonexistent Club"
        email = "student@mergington.edu"

        # Act
        response = client.delete(
            f"/activities/{activity_name}/participants/{email}"
        )

        # Assert
        assert response.status_code == 404
        assert response.json()["detail"] == "Activity not found"
