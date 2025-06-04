#!/bin/bash

# BOM API Test Script
# Bu script'i çalıştırarak tüm API endpoint'lerini test edebilirsiniz

API_URL="http://localhost:3001"

echo "🚀 BOM API Test Script'i başlatılıyor..."
echo "=====================================\n"

# Renk kodları
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test fonksiyonu
test_endpoint() {
    echo -e "${BLUE}Test: $1${NC}"
    echo "Komut: $2"
    echo "Sonuç:"
    eval $2
    echo -e "\n${GREEN}---${NC}\n"
}

# 1. Sağlık kontrolü
test_endpoint "API Sağlık Kontrolü" \
"curl -s $API_URL/api/health | jq '.database.status'"

# 2. Ana ürün oluştur
echo -e "${BLUE}Ana ürün oluşturuluyor...${NC}"
MAIN_PRODUCT=$(curl -s -X POST $API_URL/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Araba", "description": "Test amaçlı araba"}')

MAIN_ID=$(echo $MAIN_PRODUCT | jq -r '.data._id')
echo "Ana ürün ID: $MAIN_ID"
echo "$MAIN_PRODUCT" | jq
echo ""

# 3. Alt ürün oluştur
echo -e "${BLUE}Alt ürün oluşturuluyor...${NC}"
SUB_PRODUCT=$(curl -s -X POST $API_URL/api/products \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test Motor\", \"description\": \"Test motoru\", \"parentId\": \"$MAIN_ID\"}")

SUB_ID=$(echo $SUB_PRODUCT | jq -r '.data._id')
echo "Alt ürün ID: $SUB_ID"
echo "$SUB_PRODUCT" | jq
echo ""

# 4. Tüm ürünleri listele
test_endpoint "Kök Ürünleri Listele" \
"curl -s $API_URL/api/products | jq '.data[] | {name: .name, level: .level, childrenCount: .childrenCount}'"

# 5. Arama testi
test_endpoint "Arama Testi" \
"curl -s '$API_URL/api/products/search?q=Test' | jq '.data[] | {name: .name, score: .score}'"

# 6. Alt ürünleri getir
test_endpoint "Alt Ürünleri Getir" \
"curl -s $API_URL/api/products/$MAIN_ID/children | jq '.data[] | {name: .name, level: .level}'"

# 7. Ürün güncelle
test_endpoint "Ürün Güncelle" \
"curl -s -X PUT $API_URL/api/products/$SUB_ID \
  -H 'Content-Type: application/json' \
  -d '{\"name\": \"Güncellenmiş Motor\", \"description\": \"Yeni açıklama\"}' | jq '.data | {name: .name, description: .description}'"

# 8. Hata testi
test_endpoint "Hata Testi (Geçersiz ID)" \
"curl -s $API_URL/api/products/invalid-id | jq '.error'"

# 9. Validation testi
test_endpoint "Validation Testi (Name olmadan ürün oluştur)" \
"curl -s -X POST $API_URL/api/products \
  -H 'Content-Type: application/json' \
  -d '{\"description\": \"Sadece açıklama\"}' | jq '.error'"

# 10. Temizlik - Test ürünlerini sil
echo -e "${BLUE}Temizlik: Test ürünleri siliniyor...${NC}"
curl -s -X DELETE $API_URL/api/products/$MAIN_ID | jq '.message'
echo ""

echo -e "${GREEN}✅ Tüm testler tamamlandı!${NC}"
echo "Bu script'i tekrar çalıştırabilirsiniz: ./test-api.sh" 