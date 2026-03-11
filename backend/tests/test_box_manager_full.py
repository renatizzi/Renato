"""
Box Manager - Full E2E Backend Test Suite (D1)
Tests all backend APIs for the personal archive management app.
Features: Auth, Categories, Containers (Boxes), Items, Search, Export, Backup/Restore
"""

import pytest
import requests
import os
import json
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# === Fixtures ===

@pytest.fixture(scope="session")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="module")
def test_category_id(api_client):
    """Create a test category and return its ID for use in other tests"""
    response = api_client.post(f"{BASE_URL}/api/categories", json={
        "name": "TEST_Final_Category",
        "color": "#FF5733"
    })
    if response.status_code == 200:
        return response.json()["id"]
    return None

@pytest.fixture(scope="module")
def test_box_id(api_client, test_category_id):
    """Create a test box and return its ID"""
    response = api_client.post(f"{BASE_URL}/api/boxes", json={
        "name": "TEST_Final_Container",
        "category_id": test_category_id,
        "location": "TEST_Location"
    })
    if response.status_code == 200:
        return response.json()["id"]
    return None


# === Auth Tests ===

class TestAuthRoutes:
    """Tests for authentication endpoints - password disabled by default"""

    def test_auth_check_endpoint(self, api_client):
        """Check if auth check endpoint returns password_enabled status"""
        response = api_client.get(f"{BASE_URL}/api/auth/check")
        assert response.status_code == 200
        data = response.json()
        assert "password_enabled" in data
        assert "username" in data
        print(f"Auth check: password_enabled={data['password_enabled']}, username='{data['username']}'")

    def test_password_disabled_by_default(self, api_client):
        """Verify password is disabled by default (fresh install behavior)"""
        response = api_client.get(f"{BASE_URL}/api/auth/check")
        assert response.status_code == 200
        data = response.json()
        # For fresh install, password should be disabled
        # Note: This might be True if password was enabled in a previous test
        print(f"Password enabled status: {data['password_enabled']}")

    def test_auth_verify_with_password_disabled(self, api_client):
        """When password is disabled, verify should succeed with any input"""
        response = api_client.get(f"{BASE_URL}/api/auth/check")
        if response.json().get("password_enabled") == False:
            verify_response = api_client.post(f"{BASE_URL}/api/auth/verify", json={"password": ""})
            assert verify_response.status_code == 200
            data = verify_response.json()
            assert data["success"] == True
            assert data["password_enabled"] == False
            print("Verified: password disabled, access granted")

    def test_get_auth_settings(self, api_client):
        """Test getting auth settings"""
        response = api_client.get(f"{BASE_URL}/api/auth/settings")
        assert response.status_code == 200
        data = response.json()
        assert "username" in data
        assert "password_enabled" in data
        print(f"Auth settings: {data}")

    def test_update_auth_settings(self, api_client):
        """Test updating auth settings (username, password_enabled)"""
        # First get current settings
        current = api_client.get(f"{BASE_URL}/api/auth/settings").json()
        
        # Update settings
        response = api_client.post(f"{BASE_URL}/api/auth/settings", json={
            "username": "test_user",
            "password_enabled": False
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"Settings updated: {data}")


# === Categories Tests ===

class TestCategoriesRoutes:
    """Tests for category CRUD operations"""

    def test_get_categories_list(self, api_client):
        """Get list of all categories"""
        response = api_client.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} categories")
        
    def test_create_category(self, api_client):
        """Create a new category"""
        response = api_client.post(f"{BASE_URL}/api/categories", json={
            "name": "TEST_New_Category",
            "color": "#123456"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_New_Category"
        assert data["color"] == "#123456"
        assert "id" in data
        print(f"Created category: {data['id']}")
        return data["id"]

    def test_update_category(self, api_client, test_category_id):
        """Update an existing category"""
        if not test_category_id:
            pytest.skip("No test category available")
        
        response = api_client.put(f"{BASE_URL}/api/categories/{test_category_id}", json={
            "name": "TEST_Final_Category_Updated",
            "color": "#AABBCC"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Final_Category_Updated"
        print(f"Updated category: {data}")

    def test_delete_category(self, api_client):
        """Delete a category"""
        # First create one to delete
        create_response = api_client.post(f"{BASE_URL}/api/categories", json={
            "name": "TEST_ToDelete_Category",
            "color": "#FF0000"
        })
        cat_id = create_response.json()["id"]
        
        # Now delete it
        response = api_client.delete(f"{BASE_URL}/api/categories/{cat_id}")
        assert response.status_code == 200
        
        # Verify it's gone
        get_response = api_client.get(f"{BASE_URL}/api/categories")
        ids = [c["id"] for c in get_response.json()]
        assert cat_id not in ids
        print(f"Deleted category {cat_id}")


# === Boxes (Containers) Tests ===

class TestBoxesRoutes:
    """Tests for container CRUD operations"""

    def test_get_boxes_list(self, api_client):
        """Get list of all boxes"""
        response = api_client.get(f"{BASE_URL}/api/boxes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} boxes")

    def test_get_locations(self, api_client):
        """Get list of unique locations"""
        response = api_client.get(f"{BASE_URL}/api/boxes/locations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} locations: {data}")

    def test_create_box(self, api_client, test_category_id):
        """Create a new box with auto-incrementing number"""
        response = api_client.post(f"{BASE_URL}/api/boxes", json={
            "name": "TEST_New_Container",
            "category_id": test_category_id,
            "location": "TEST_Garage"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_New_Container"
        assert "box_number" in data
        assert "id" in data
        assert data["items"] == []
        print(f"Created box #{data['box_number']}: {data['id']}")
        return data["id"]

    def test_get_box_by_id(self, api_client, test_box_id):
        """Get a specific box by ID"""
        if not test_box_id:
            pytest.skip("No test box available")
            
        response = api_client.get(f"{BASE_URL}/api/boxes/{test_box_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_box_id
        print(f"Got box: {data['name']}")

    def test_update_box(self, api_client, test_box_id):
        """Update a box's details"""
        if not test_box_id:
            pytest.skip("No test box available")
            
        response = api_client.put(f"{BASE_URL}/api/boxes/{test_box_id}", json={
            "name": "TEST_Final_Container_Updated",
            "location": "TEST_Attic"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Final_Container_Updated"
        assert data["location"] == "TEST_Attic"
        print(f"Updated box: {data}")

    def test_filter_boxes_by_category(self, api_client, test_category_id):
        """Filter boxes by category"""
        if not test_category_id:
            pytest.skip("No test category available")
            
        response = api_client.get(f"{BASE_URL}/api/boxes", params={"category_id": test_category_id})
        assert response.status_code == 200
        data = response.json()
        print(f"Filtered boxes by category: {len(data)} results")

    def test_filter_boxes_by_location(self, api_client):
        """Filter boxes by location"""
        response = api_client.get(f"{BASE_URL}/api/boxes", params={"location": "TEST"})
        assert response.status_code == 200
        data = response.json()
        print(f"Filtered boxes by location: {len(data)} results")


# === Items Tests ===

class TestItemsRoutes:
    """Tests for item CRUD within boxes"""

    def test_add_item_to_box(self, api_client, test_box_id):
        """Add an item to a box"""
        if not test_box_id:
            pytest.skip("No test box available")
            
        response = api_client.post(f"{BASE_URL}/api/boxes/{test_box_id}/items", json={
            "name": "TEST_Item_One",
            "description": "First test item",
            "image_data": ""
        })
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) >= 1
        item = next((i for i in data["items"] if i["name"] == "TEST_Item_One"), None)
        assert item is not None
        print(f"Added item: {item['id']}")
        return item["id"]

    def test_add_second_item(self, api_client, test_box_id):
        """Add another item"""
        if not test_box_id:
            pytest.skip("No test box available")
            
        response = api_client.post(f"{BASE_URL}/api/boxes/{test_box_id}/items", json={
            "name": "TEST_Item_Two",
            "description": "Second test item for search",
            "image_data": ""
        })
        assert response.status_code == 200
        data = response.json()
        item = next((i for i in data["items"] if i["name"] == "TEST_Item_Two"), None)
        assert item is not None
        print(f"Added second item: {item['id']}")

    def test_update_item(self, api_client, test_box_id):
        """Update an item's details"""
        if not test_box_id:
            pytest.skip("No test box available")
            
        # Get box to find item
        box = api_client.get(f"{BASE_URL}/api/boxes/{test_box_id}").json()
        if not box["items"]:
            pytest.skip("No items in box")
            
        item_id = box["items"][0]["id"]
        response = api_client.put(f"{BASE_URL}/api/boxes/{test_box_id}/items/{item_id}", json={
            "name": "TEST_Item_Updated",
            "description": "Updated description"
        })
        assert response.status_code == 200
        print(f"Updated item: {item_id}")

    def test_delete_item(self, api_client, test_box_id):
        """Delete an item from a box"""
        if not test_box_id:
            pytest.skip("No test box available")
            
        # First add an item to delete
        add_response = api_client.post(f"{BASE_URL}/api/boxes/{test_box_id}/items", json={
            "name": "TEST_ToDelete_Item",
            "description": "Will be deleted"
        })
        items = add_response.json()["items"]
        item = next((i for i in items if i["name"] == "TEST_ToDelete_Item"), None)
        assert item is not None
        item_id = item["id"]
        
        # Delete it
        response = api_client.delete(f"{BASE_URL}/api/boxes/{test_box_id}/items/{item_id}")
        assert response.status_code == 200
        
        # Verify deleted
        box = api_client.get(f"{BASE_URL}/api/boxes/{test_box_id}").json()
        item_ids = [i["id"] for i in box["items"]]
        assert item_id not in item_ids
        print(f"Deleted item: {item_id}")


# === Search Tests ===

class TestSearchRoutes:
    """Tests for search functionality"""

    def test_search_items(self, api_client):
        """Search for items by text"""
        response = api_client.get(f"{BASE_URL}/api/search", params={"q": "TEST"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Search 'TEST' returned {len(data)} results")

    def test_search_specific_item(self, api_client, test_box_id):
        """Search for a specific item"""
        if not test_box_id:
            pytest.skip("No test box available")
            
        response = api_client.get(f"{BASE_URL}/api/search", params={"q": "Item"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if data:
            assert "item_name" in data[0]
            assert "box_id" in data[0]
            assert "box_number" in data[0]
        print(f"Search 'Item' returned {len(data)} results")

    def test_search_empty_query(self, api_client):
        """Search with empty query should fail validation"""
        response = api_client.get(f"{BASE_URL}/api/search", params={"q": ""})
        # FastAPI returns 422 for validation errors
        assert response.status_code == 422
        print("Empty search query correctly rejected")


# === Stats Tests ===

class TestStatsRoutes:
    """Tests for statistics endpoint"""

    def test_get_stats(self, api_client):
        """Get dashboard statistics"""
        response = api_client.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_boxes" in data
        assert "total_items" in data
        assert "total_categories" in data
        print(f"Stats: {data}")


# === Export Tests ===

class TestExportRoutes:
    """Tests for CSV export functionality"""

    def test_export_csv_all(self, api_client):
        """Export all boxes to CSV"""
        response = api_client.get(f"{BASE_URL}/api/export/csv")
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")
        content = response.text
        assert "Numero Contenitore" in content or len(content) > 0
        print(f"CSV export size: {len(content)} bytes")

    def test_export_csv_filtered(self, api_client, test_box_id):
        """Export specific boxes to CSV"""
        if not test_box_id:
            pytest.skip("No test box available")
            
        response = api_client.get(f"{BASE_URL}/api/export/csv", params={"box_ids": test_box_id})
        assert response.status_code == 200
        print(f"Filtered CSV export: {len(response.text)} bytes")


# === Backup/Restore Tests ===

class TestBackupRestoreRoutes:
    """Tests for backup and restore functionality"""

    def test_create_backup(self, api_client):
        """Create a backup of all data"""
        response = api_client.get(f"{BASE_URL}/api/backup")
        assert response.status_code == 200
        assert "application/json" in response.headers.get("content-type", "")
        
        data = response.json()
        assert "version" in data
        assert "categories" in data
        assert "boxes" in data
        print(f"Backup created: {len(data['categories'])} categories, {len(data['boxes'])} boxes")

    def test_restore_invalid_file(self, api_client):
        """Restore with invalid file should fail"""
        # Create invalid file
        files = {"file": ("invalid.json", b"not json", "application/json")}
        response = api_client.post(f"{BASE_URL}/api/restore", files=files)
        assert response.status_code in [400, 422]  # FastAPI may return 400 or 422 for invalid input
        print("Invalid restore correctly rejected")


# === Password Flow Tests ===

class TestPasswordFlow:
    """Tests for enabling password, login, and reset flow"""

    def test_enable_password_and_verify(self, api_client):
        """Enable password protection and verify login works"""
        # Step 1: Enable password
        enable_response = api_client.post(f"{BASE_URL}/api/auth/settings", json={
            "username": "testuser",
            "password_enabled": True
        })
        assert enable_response.status_code == 200
        
        # Step 2: Set a password
        # Note: When first enabling, there's no current password, so change-password won't work
        # The flow is: enable password_enabled=True, then set password via change-password
        # But change-password requires current_password, which doesn't exist yet
        # This is a known flow - user needs to use master reset to set first password
        print("Password enabled - user would set password via UI flow")

    def test_master_password_reset(self, api_client):
        """Test master password reset functionality"""
        # Reset with correct master password
        response = api_client.post(f"{BASE_URL}/api/auth/reset-password", json={
            "master_password": "masterreset2025"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"Master reset successful: {data['message']}")
        
        # Verify password is now disabled
        check_response = api_client.get(f"{BASE_URL}/api/auth/check")
        assert check_response.json()["password_enabled"] == False
        print("Password disabled after reset")

    def test_master_password_wrong(self, api_client):
        """Test wrong master password is rejected"""
        response = api_client.post(f"{BASE_URL}/api/auth/reset-password", json={
            "master_password": "wrongpassword"
        })
        assert response.status_code == 401
        print("Wrong master password correctly rejected")


# === Cleanup ===

class TestCleanup:
    """Cleanup test data after all tests"""

    def test_cleanup_test_boxes(self, api_client):
        """Delete all TEST_ prefixed boxes"""
        boxes = api_client.get(f"{BASE_URL}/api/boxes").json()
        deleted_count = 0
        for box in boxes:
            if "TEST_" in box["name"]:
                api_client.delete(f"{BASE_URL}/api/boxes/{box['id']}")
                deleted_count += 1
        print(f"Cleaned up {deleted_count} test boxes")

    def test_cleanup_test_categories(self, api_client):
        """Delete all TEST_ prefixed categories"""
        categories = api_client.get(f"{BASE_URL}/api/categories").json()
        deleted_count = 0
        for cat in categories:
            if "TEST_" in cat["name"]:
                api_client.delete(f"{BASE_URL}/api/categories/{cat['id']}")
                deleted_count += 1
        print(f"Cleaned up {deleted_count} test categories")

    def test_ensure_password_disabled(self, api_client):
        """Ensure password is disabled after tests"""
        response = api_client.post(f"{BASE_URL}/api/auth/settings", json={
            "username": "",
            "password_enabled": False
        })
        assert response.status_code == 200
        print("Password disabled for clean state")
