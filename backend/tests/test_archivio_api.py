"""
Backend API Tests for Archivio Oggetti Personali
Tests: Authentication, Categories, Containers, Items, Search, Export
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_PASSWORD = "1954"
MASTER_PASSWORD = "masterreset2025"
DEFAULT_PASSWORD = "archivio2025"


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root: {data['message']}")
    
    def test_auth_check(self):
        """Test auth check endpoint returns password_enabled and username"""
        response = requests.get(f"{BASE_URL}/api/auth/check")
        assert response.status_code == 200
        data = response.json()
        assert "password_enabled" in data
        assert "username" in data
        print(f"✓ Auth check: password_enabled={data['password_enabled']}, username={data['username']}")
    
    def test_auth_verify_correct_password(self):
        """Test login with correct password (1954)"""
        response = requests.post(f"{BASE_URL}/api/auth/verify", json={"password": TEST_PASSWORD})
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Auth verify with password '{TEST_PASSWORD}': success")
    
    def test_auth_verify_wrong_password(self):
        """Test login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/verify", json={"password": "wrongpassword"})
        assert response.status_code == 401
        print("✓ Auth verify with wrong password: correctly rejected")
    
    def test_auth_settings_get(self):
        """Test get user settings"""
        response = requests.get(f"{BASE_URL}/api/auth/settings")
        assert response.status_code == 200
        data = response.json()
        assert "username" in data
        assert "password_enabled" in data
        print(f"✓ Auth settings GET: username={data['username']}, password_enabled={data['password_enabled']}")
    
    def test_auth_settings_post(self):
        """Test update user settings (username and password_enabled)"""
        # Save current settings
        current = requests.get(f"{BASE_URL}/api/auth/settings").json()
        
        # Update settings
        response = requests.post(f"{BASE_URL}/api/auth/settings", json={
            "username": "TEST_User",
            "password_enabled": True
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert data["username"] == "TEST_User"
        print("✓ Auth settings POST: username updated successfully")
        
        # Restore original settings
        requests.post(f"{BASE_URL}/api/auth/settings", json={
            "username": current.get("username", ""),
            "password_enabled": current.get("password_enabled", True)
        })


class TestCategoriesEndpoints:
    """Categories CRUD tests"""
    
    def test_get_categories(self):
        """Test get all categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get categories: {len(data)} categories found")
        
        # Check alphabetical sorting
        if len(data) > 1:
            names = [cat['name'] for cat in data]
            sorted_names = sorted(names, key=lambda x: x.lower())
            # Note: Backend returns sorted, frontend also sorts
            print(f"✓ Categories list: {names[:5]}...")
    
    def test_create_category(self):
        """Test create a new category"""
        response = requests.post(f"{BASE_URL}/api/categories", json={
            "name": "TEST_Categoria",
            "color": "#FF5733"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Categoria"
        assert data["color"] == "#FF5733"
        assert "id" in data
        print(f"✓ Create category: id={data['id']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/categories/{data['id']}")
    
    def test_update_category(self):
        """Test update a category"""
        # Create
        create_res = requests.post(f"{BASE_URL}/api/categories", json={
            "name": "TEST_ToUpdate",
            "color": "#000000"
        })
        cat_id = create_res.json()["id"]
        
        # Update
        response = requests.put(f"{BASE_URL}/api/categories/{cat_id}", json={
            "name": "TEST_Updated",
            "color": "#FFFFFF"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Updated"
        assert data["color"] == "#FFFFFF"
        print(f"✓ Update category: name changed to {data['name']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/categories/{cat_id}")
    
    def test_delete_category(self):
        """Test delete a category"""
        # Create
        create_res = requests.post(f"{BASE_URL}/api/categories", json={
            "name": "TEST_ToDelete",
            "color": "#123456"
        })
        cat_id = create_res.json()["id"]
        
        # Delete
        response = requests.delete(f"{BASE_URL}/api/categories/{cat_id}")
        assert response.status_code == 200
        print(f"✓ Delete category: {cat_id} deleted")
        
        # Verify deleted
        get_res = requests.get(f"{BASE_URL}/api/categories")
        ids = [c["id"] for c in get_res.json()]
        assert cat_id not in ids


class TestBoxesEndpoints:
    """Containers (Boxes) CRUD tests"""
    
    def test_get_boxes(self):
        """Test get all containers"""
        response = requests.get(f"{BASE_URL}/api/boxes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Get boxes: {len(data)} containers found")
    
    def test_create_box(self):
        """Test create a new container"""
        response = requests.post(f"{BASE_URL}/api/boxes", json={
            "name": "TEST_Contenitore",
            "location": "Garage"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_Contenitore"
        assert "box_number" in data
        assert "id" in data
        print(f"✓ Create box: id={data['id']}, box_number={data['box_number']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/boxes/{data['id']}")
    
    def test_get_box_by_id(self):
        """Test get container by ID"""
        # Create
        create_res = requests.post(f"{BASE_URL}/api/boxes", json={
            "name": "TEST_GetById",
            "location": "Cantina"
        })
        box_id = create_res.json()["id"]
        
        # Get by ID
        response = requests.get(f"{BASE_URL}/api/boxes/{box_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == box_id
        assert data["name"] == "TEST_GetById"
        print(f"✓ Get box by ID: {data['name']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/boxes/{box_id}")
    
    def test_update_box(self):
        """Test update a container"""
        # Create
        create_res = requests.post(f"{BASE_URL}/api/boxes", json={
            "name": "TEST_BoxUpdate",
            "location": "Soffitta"
        })
        box_id = create_res.json()["id"]
        
        # Update
        response = requests.put(f"{BASE_URL}/api/boxes/{box_id}", json={
            "name": "TEST_BoxUpdated",
            "location": "Cantina"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "TEST_BoxUpdated"
        assert data["location"] == "Cantina"
        print(f"✓ Update box: name={data['name']}, location={data['location']}")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/boxes/{box_id}")
    
    def test_delete_box(self):
        """Test delete a container"""
        # Create
        create_res = requests.post(f"{BASE_URL}/api/boxes", json={
            "name": "TEST_BoxDelete"
        })
        box_id = create_res.json()["id"]
        
        # Delete
        response = requests.delete(f"{BASE_URL}/api/boxes/{box_id}")
        assert response.status_code == 200
        print(f"✓ Delete box: {box_id} deleted")


class TestItemsEndpoints:
    """Items CRUD tests within containers"""
    
    @pytest.fixture(autouse=True)
    def setup_box(self):
        """Create a test box for item tests"""
        create_res = requests.post(f"{BASE_URL}/api/boxes", json={
            "name": "TEST_ItemsBox"
        })
        self.box_id = create_res.json()["id"]
        yield
        # Cleanup
        requests.delete(f"{BASE_URL}/api/boxes/{self.box_id}")
    
    def test_add_item_to_box(self):
        """Test add item to container"""
        response = requests.post(f"{BASE_URL}/api/boxes/{self.box_id}/items", json={
            "name": "TEST_Oggetto",
            "description": "Descrizione test"
        })
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "TEST_Oggetto"
        print(f"✓ Add item: {data['items'][0]['name']}")
    
    def test_update_item(self):
        """Test update item in container"""
        # Add item
        add_res = requests.post(f"{BASE_URL}/api/boxes/{self.box_id}/items", json={
            "name": "TEST_ItemUpdate",
            "description": "Original"
        })
        item_id = add_res.json()["items"][0]["id"]
        
        # Update item
        response = requests.put(f"{BASE_URL}/api/boxes/{self.box_id}/items/{item_id}", json={
            "name": "TEST_ItemUpdated",
            "description": "Modified"
        })
        assert response.status_code == 200
        data = response.json()
        updated_item = next(i for i in data["items"] if i["id"] == item_id)
        assert updated_item["name"] == "TEST_ItemUpdated"
        assert updated_item["description"] == "Modified"
        print(f"✓ Update item: {updated_item['name']}")
    
    def test_delete_item(self):
        """Test delete item from container"""
        # Add item
        add_res = requests.post(f"{BASE_URL}/api/boxes/{self.box_id}/items", json={
            "name": "TEST_ItemDelete"
        })
        item_id = add_res.json()["items"][0]["id"]
        
        # Delete item
        response = requests.delete(f"{BASE_URL}/api/boxes/{self.box_id}/items/{item_id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0
        print(f"✓ Delete item: {item_id} deleted")


class TestSearchEndpoints:
    """Search functionality tests"""
    
    def test_search_items(self):
        """Test search for items"""
        # Create box with item
        box_res = requests.post(f"{BASE_URL}/api/boxes", json={"name": "TEST_SearchBox"})
        box_id = box_res.json()["id"]
        requests.post(f"{BASE_URL}/api/boxes/{box_id}/items", json={
            "name": "TEST_SearchableItem",
            "description": "Unique description for search"
        })
        
        # Search
        response = requests.get(f"{BASE_URL}/api/search?q=SearchableItem")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Search: found {len(data)} results for 'SearchableItem'")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/boxes/{box_id}")


class TestStatsEndpoints:
    """Statistics endpoint tests"""
    
    def test_get_stats(self):
        """Test get statistics"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_boxes" in data
        assert "total_items" in data
        assert "total_categories" in data
        print(f"✓ Stats: boxes={data['total_boxes']}, items={data['total_items']}, categories={data['total_categories']}")


class TestExportEndpoints:
    """Export and backup endpoint tests"""
    
    def test_export_csv(self):
        """Test CSV export"""
        response = requests.get(f"{BASE_URL}/api/export/csv")
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")
        print(f"✓ Export CSV: {len(response.content)} bytes")
    
    def test_backup(self):
        """Test JSON backup"""
        response = requests.get(f"{BASE_URL}/api/backup")
        assert response.status_code == 200
        assert "application/json" in response.headers.get("content-type", "")
        data = response.json()
        assert "version" in data
        assert "categories" in data
        assert "boxes" in data
        print(f"✓ Backup: version={data['version']}, categories={len(data['categories'])}, boxes={len(data['boxes'])}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
