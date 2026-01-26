#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ArchiveAPITester:
    def __init__(self, base_url="https://storage-catalog.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_items = {
            'categories': [],
            'boxes': [],
            'items': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")

            return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_stats_endpoint(self):
        """Test stats endpoint"""
        return self.run_test("Stats", "GET", "stats", 200)

    def test_category_crud(self):
        """Test category CRUD operations"""
        print("\n📁 Testing Category Operations...")
        
        # Create category
        category_data = {
            "name": f"Test Category {datetime.now().strftime('%H%M%S')}",
            "color": "#FF5733"
        }
        success, response = self.run_test("Create Category", "POST", "categories", 200, category_data)
        if not success:
            return False
        
        category_id = response.get('id')
        if category_id:
            self.created_items['categories'].append(category_id)
        
        # Get categories
        success, _ = self.run_test("Get Categories", "GET", "categories", 200)
        if not success:
            return False
        
        # Update category
        if category_id:
            update_data = {"name": "Updated Category", "color": "#33FF57"}
            success, _ = self.run_test("Update Category", "PUT", f"categories/{category_id}", 200, update_data)
            if not success:
                return False
        
        return True

    def test_box_crud(self):
        """Test box CRUD operations"""
        print("\n📦 Testing Box Operations...")
        
        # Create box
        box_data = {
            "name": f"Test Box {datetime.now().strftime('%H%M%S')}",
            "location": "Test Location"
        }
        
        # Add category if available
        if self.created_items['categories']:
            box_data["category_id"] = self.created_items['categories'][0]
        
        success, response = self.run_test("Create Box", "POST", "boxes", 200, box_data)
        if not success:
            return False
        
        box_id = response.get('id')
        if box_id:
            self.created_items['boxes'].append(box_id)
        
        # Get boxes
        success, _ = self.run_test("Get Boxes", "GET", "boxes", 200)
        if not success:
            return False
        
        # Get single box
        if box_id:
            success, _ = self.run_test("Get Single Box", "GET", f"boxes/{box_id}", 200)
            if not success:
                return False
        
        # Update box
        if box_id:
            update_data = {"name": "Updated Box Name", "location": "Updated Location"}
            success, _ = self.run_test("Update Box", "PUT", f"boxes/{box_id}", 200, update_data)
            if not success:
                return False
        
        return True

    def test_item_crud(self):
        """Test item CRUD operations within boxes"""
        print("\n📋 Testing Item Operations...")
        
        if not self.created_items['boxes']:
            print("❌ No boxes available for item testing")
            return False
        
        box_id = self.created_items['boxes'][0]
        
        # Add item to box
        item_data = {
            "name": f"Test Item {datetime.now().strftime('%H%M%S')}",
            "description": "Test item description"
        }
        success, response = self.run_test("Add Item to Box", "POST", f"boxes/{box_id}/items", 200, item_data)
        if not success:
            return False
        
        # Extract item ID from response
        items = response.get('items', [])
        item_id = None
        if items:
            item_id = items[-1].get('id')  # Get the last added item
            if item_id:
                self.created_items['items'].append(item_id)
        
        # Update item
        if item_id:
            update_data = {"name": "Updated Item", "description": "Updated description"}
            success, _ = self.run_test("Update Item", "PUT", f"boxes/{box_id}/items/{item_id}", 200, update_data)
            if not success:
                return False
        
        return True

    def test_search_functionality(self):
        """Test search functionality"""
        print("\n🔍 Testing Search Operations...")
        
        # Search for items
        success, _ = self.run_test("Search Items", "GET", "search", 200, params={"q": "test"})
        return success

    def test_auth_functionality(self):
        """Test authentication functionality"""
        print("\n🔐 Testing Authentication...")
        
        # Test correct password
        auth_data = {"password": "archivio2025"}
        success, response = self.run_test("Login with correct password", "POST", "auth/verify", 200, auth_data)
        if not success:
            return False
        
        # Test wrong password
        wrong_auth_data = {"password": "wrongpassword"}
        success, _ = self.run_test("Login with wrong password", "POST", "auth/verify", 401, wrong_auth_data)
        if success:  # We expect this to fail (401), so success means the test passed
            self.tests_passed += 1
            print("✅ Passed - Wrong password correctly rejected")
        else:
            print("❌ Failed - Wrong password should return 401")
            return False
        
        return True

    def test_location_filter(self):
        """Test location filtering functionality"""
        print("\n📍 Testing Location Filter...")
        
        # Test get locations endpoint
        success, response = self.run_test("Get Locations", "GET", "boxes/locations", 200)
        if not success:
            return False
        
        # Test filtering boxes by location if we have boxes with locations
        if self.created_items['boxes']:
            success, _ = self.run_test("Filter boxes by location", "GET", "boxes", 200, params={"location": "Test"})
            if not success:
                return False
        
        return True

    def test_image_data_functionality(self):
        """Test image_data functionality in items (base64 images)"""
        print("\n🖼️ Testing Image Data in Items...")
        
        if not self.created_items['boxes']:
            print("❌ No boxes available for image data testing")
            return False
        
        box_id = self.created_items['boxes'][0]
        
        # Sample base64 image data (1x1 pixel JPEG)
        sample_base64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        
        # Add item with image data
        item_data = {
            "name": f"Test Item with Image {datetime.now().strftime('%H%M%S')}",
            "description": "Test item with base64 image",
            "image_data": sample_base64
        }
        success, response = self.run_test("Add Item with Image Data", "POST", f"boxes/{box_id}/items", 200, item_data)
        if not success:
            return False
        
        # Verify image_data is in response
        items = response.get('items', [])
        if items:
            last_item = items[-1]
            if last_item.get('image_data') == item_data['image_data']:
                print("✅ Image data correctly stored and returned")
            else:
                print("❌ Image data not properly stored")
                return False
        
        return True

    def test_export_functionality(self):
        """Test export functionality"""
        print("\n📄 Testing Export Operations...")
        
        # Test CSV export
        success, _ = self.run_test("Export CSV", "GET", "export/csv", 200)
        return success

    def test_password_management(self):
        """Test password change and reset functionality"""
        print("\n🔑 Testing Password Management...")
        
        # Test change password with correct current password
        change_data = {
            "current_password": "archivio2025",
            "new_password": "newpass123"
        }
        success, response = self.run_test("Change Password", "POST", "auth/change-password", 200, change_data)
        if not success:
            return False
        
        # Test login with new password
        auth_data = {"password": "newpass123"}
        success, _ = self.run_test("Login with new password", "POST", "auth/verify", 200, auth_data)
        if not success:
            return False
        
        # Test change password with wrong current password
        wrong_change_data = {
            "current_password": "wrongpass",
            "new_password": "anotherpass"
        }
        success, _ = self.run_test("Change password with wrong current", "POST", "auth/change-password", 401, wrong_change_data)
        if success:  # We expect this to fail (401)
            self.tests_passed += 1
            print("✅ Passed - Wrong current password correctly rejected")
        else:
            print("❌ Failed - Wrong current password should return 401")
            return False
        
        # Test password reset with correct master password
        reset_data = {"master_password": "masterreset2025"}
        success, response = self.run_test("Reset password with master", "POST", "auth/reset-password", 200, reset_data)
        if not success:
            return False
        
        # Test password reset with wrong master password
        wrong_reset_data = {"master_password": "wrongmaster"}
        success, _ = self.run_test("Reset password with wrong master", "POST", "auth/reset-password", 401, wrong_reset_data)
        if success:  # We expect this to fail (401)
            self.tests_passed += 1
            print("✅ Passed - Wrong master password correctly rejected")
        else:
            print("❌ Failed - Wrong master password should return 401")
            return False
        
        # Verify password was reset to default
        auth_data = {"password": "archivio2025"}
        success, _ = self.run_test("Login with reset password", "POST", "auth/verify", 200, auth_data)
        if not success:
            return False
        
        return True

    def test_backup_restore(self):
        """Test backup and restore functionality"""
        print("\n💾 Testing Backup & Restore...")
        
        # Test backup endpoint
        success, response = self.run_test("Get Backup", "GET", "backup", 200)
        if not success:
            return False
        
        # Note: We can't easily test restore without file upload in this simple test
        # The restore endpoint requires multipart/form-data which is more complex
        print("ℹ️  Restore endpoint testing requires file upload - will be tested in frontend")
        
        return True

    def cleanup(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete items (they get deleted with boxes)
        
        # Delete boxes
        for box_id in self.created_items['boxes']:
            try:
                self.run_test(f"Delete Box {box_id}", "DELETE", f"boxes/{box_id}", 200)
            except:
                pass
        
        # Delete categories
        for category_id in self.created_items['categories']:
            try:
                self.run_test(f"Delete Category {category_id}", "DELETE", f"categories/{category_id}", 200)
            except:
                pass

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Archive API Tests...")
        print(f"Testing against: {self.api_url}")
        
        try:
            # Basic connectivity
            if not self.test_root_endpoint():
                print("❌ Root endpoint failed, stopping tests")
                return False
            
            # Authentication tests (new feature)
            if not self.test_auth_functionality():
                print("❌ Authentication failed")
                return False
            
            # Stats endpoint
            if not self.test_stats_endpoint():
                print("❌ Stats endpoint failed")
                return False
            
            # Category operations
            if not self.test_category_crud():
                print("❌ Category operations failed")
                return False
            
            # Box operations
            if not self.test_box_crud():
                print("❌ Box operations failed")
                return False
            
            # Location filter tests (new feature)
            if not self.test_location_filter():
                print("❌ Location filter failed")
                return False
            
            # Item operations
            if not self.test_item_crud():
                print("❌ Item operations failed")
                return False
            
            # Image data functionality (updated feature)
            if not self.test_image_data_functionality():
                print("❌ Image data functionality failed")
                return False
            
            # Search functionality
            if not self.test_search_functionality():
                print("❌ Search functionality failed")
                return False
            
            # Export functionality
            if not self.test_export_functionality():
                print("❌ Export functionality failed")
                return False
            
            # Password management (new feature)
            if not self.test_password_management():
                print("❌ Password management failed")
                return False
            
            # Backup & restore (new feature)
            if not self.test_backup_restore():
                print("❌ Backup & restore failed")
                return False
            
            return True
            
        finally:
            # Always cleanup
            self.cleanup()

def main():
    tester = ArchiveAPITester()
    
    success = tester.run_all_tests()
    
    # Print results
    print(f"\n📊 Test Results:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "No tests run")
    
    return 0 if success and tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())