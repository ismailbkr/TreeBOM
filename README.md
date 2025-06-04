#  BOM (Bill of Materials) - Ürün Ağacı Uygulaması

Modern ve kullanıcı dostu web tabanlı Ürün Ağacı yönetim sistemi. Hiyerarşik ürün yapılarını kolayca oluşturun, yönetin ve analiz edin.

---

##  Hızlı Başlangıç

### Backend Sunucusu
```bash
cd bom-app/server
npm install
npm run dev        # http://localhost:3001
```

### Frontend Arayüzü  
```bash
cd bom-app/client
npm install
npm run dev        # http://localhost:5174
```

---

## Ayrıntılı Modüller

**Ürün Ekleme ve Silme**
1. Arama butonu altında bulunan "Yeni Ana Ürün" butonunu tıklayarak yeni bir ana ürün eklersin.
2. Eğer bir alt ürün ekleyeceksen hangi ana ürünün alt ürünü olarak ekleyeceğini seçersin ve seçtiğin ana ürünün yanındaki artı butonuna basarak maksimum 100 karekter uzunluğunda bir "Ürün Adı" ve isteğe bağlı olarak maksimum 500 karakter uzunluğunda bir açıklama yazarak ekleyebilirsin.
3. Silmek istediğin ürün bir ana ürünse bu ana ürünü silince bir alt levelinde bulunan alt ürünler otomatik olarak ana ürün olur.
4. Silmek istediğin ürünün bir alt ürünü yoksa direkt silinir.

**Ürün Arama**
1. Ekranın üstünde bulunan arama çubuğuna aramak istediğin kelime veya ifadeyi yazarsan, ürünün adında veya açıklamasında eşleşme olan tüm ürünler listelenir.
2. Arama çubuğu altında bulunan yenile butonuna basılınca sayfa yenilenir ve ilk halina yani tüm ana ürünlerin ekranda göründüğü haline geri döner. 

**Ürün Parça Hiyerarşisi**
1. Her ana ürünün birden çok alt ürünü olabilir sayısı kullanıcı ne kadar isterse o kadar olur.
2. Alt ürünü olan her ürünün sağında aşağı yönü belirten bir ok bulunur, bu oka basılarak accordion yapısında alt ürünler listelenir.
3. Her ürün herhangi bir başka ürünün alt ürünü olarak eklenebilir. Bir ürünü başka bir ürünün alt ürünü yapmak için, ürünün sağındaki çift yönlü ok simgesine tıklayıp. Açılan listeden istediğiniz üst ürünü seçin. Böylece ürün, seçilen üst ürünün alt ürünü olur. Taşınan ürünün mevcut alt ürünleri varsa, bunlar da yeni üst ürünün alt ürünleri olarak güncellenir.

---

## 📸 Uygulama Ekran Görüntüleri

### Ana Ekran
Uygulamanın ana sayfası - başlık, arama çubuğu, istatistik kartları ve ürün ağacı görünümü
![Ana Ekran](./secreenshots/Ana%20ekran.png)

### Ürün Ekleme İşlemleri

#### Ana Ürün Ekleme
Yeni bir kök seviye ürün ekleme modal formu
![Ana Ürün Ekleme](./secreenshots/Ana%20ürün%20ekleme.png)

#### Alt Ürün Ekleme  
Mevcut bir ürüne alt ürün ekleme işlemi
![Alt Ürün Ekleme](./secreenshots/Alt%20ürün%20ekleme.png)

### Hiyerarşik Yapı
Accordion formatında genişletilebilir ürün ağacı görünümü
![Accordion Yapısı](./secreenshots/Accordion%20yapısı.png)

### Arama Özellikleri

#### Ana Ürün Arama
Ana ürünlerde arama yapılması ve sonuçların filtrelenmesi
![Ana Ürün Arama](./secreenshots/Ana%20ürün%20arama.png)

#### Alt Ürün Arama
Alt ürünlerde arama yapılması ve ilgili ağaç dallarının otomatik açılması
![Alt Ürün Arama](./secreenshots/Alt%20ürün%20arama.png)

### Ürün Taşıma Özelliği
Ürünleri farklı hiyerarşi seviyelerine taşıma modal'ı 
![Alt Ürün Olarak Taşıma](./secreenshots/Alt%20ürün%20olarak%20taşıma.png)

### Ürün Silme İşlemleri

#### Ana Ürün Silme
Ana ürün silme onay modal'ı - Alt ürünler otomatik kök seviyeye taşınır
![Ana Ürün Silme](./secreenshots/Ana%20ürün%20silme.png)

#### Alt Ürün Silme
Alt ürün silme onay modal'ı
![Alt Ürün Silme](./secreenshots/Alt%20ürün%20silme.png)

---

## Teknolojiler

**Veritabanı ve API**
1. Veri tabanı olarak MongoDB kullanıldı.
2. CRUD işlemleri için RESTful API mimarisi kullanıldı.

**Backend**
1. JavaScript (ES6+) kullanıldı.
2. Sunucu ortamı için Node.js kullanıldı.
3. RESTful API ler ve HTTP istekleri için Express.js kullanıldı.

**Frontend**
1. JavaScript tabanlı React kullanıldı.
2. API lerle veri alışverişi için Axios kullanıldı. 
3. Derleme süreçleri için Vite kullanuldı. 


