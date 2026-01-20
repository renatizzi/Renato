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

    def test_export_functionality(self):
        """Test export functionality"""
        print("\n📄 Testing Export Operations...")
        
        # Test CSV export
        success, _ = self.run_test("Export CSV", "GET", "export/csv", 200)
        return success

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
            
            # Item operations
            if not self.test_item_crud():
                print("❌ Item operations failed")
                return False
            
            # Search functionality
            if not self.test_search_functionality():
                print("❌ Search functionality failed")
                return False
            
            # Export functionality
            if not self.test_export_functionality():
                print("❌ Export functionality failed")
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