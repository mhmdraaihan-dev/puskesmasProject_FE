# Dokumentasi User Management & Health Data System untuk Frontend

## 📋 Overview Sistem

Sistem ini memiliki 4 jenis user dengan akses berbeda:

1. **ADMIN** - Full access ke semua data
2. **Bidan Praktik** - Lihat & kelola data dari practice place sendiri
3. **Bidan Desa** - Lihat & verifikasi data dari semua practice place di desa yang di-assign
4. **Bidan Koordinator** - Lihat semua data (fokus yang sudah APPROVED)

---

## 🏗️ Struktur Data Hierarki

```
Village (Desa)
├── Users (Bidan Desa yang di-assign ke desa ini)
│   └── village_id: "xxx" (Foreign Key ke Village)
│
└── Practice Places (Tempat praktik di desa ini)
    ├── village_id: "xxx" (Foreign Key ke Village)
    ├── user_id: "yyy" (Foreign Key ke User - Bidan Praktik pemilik)
    │
    └── Health Data (Data kesehatan dari practice place ini)
        └── practice_id: "zzz" (Foreign Key ke Practice Place)
```

---

## 👥 User Management

### 1. Create User (Admin Only)

**Endpoint:** `POST /api/users`

**Headers:**

```
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

#### A. Create ADMIN

```json
{
  "full_name": "Admin Utama",
  "email": "admin@example.com",
  "password": "password123",
  "phone_number": "081234567890",
  "address": "Alamat Admin",
  "role": "ADMIN",
  "status_user": "ACTIVE"
}
```

**Catatan:** Admin TIDAK perlu `position_user` dan `village_id`

---

#### B. Create Bidan Praktik

```json
{
  "full_name": "Bidan Praktik A",
  "email": "bidan.praktik@example.com",
  "password": "password123",
  "phone_number": "081234567890",
  "address": "Alamat Bidan",
  "position_user": "bidan_praktik",
  "role": "USER",
  "status_user": "ACTIVE"
}
```

**⚠️ PENTING untuk Bidan Praktik:**

- Setelah user dibuat, **WAJIB** buat `practice_place` untuk user ini
- Bidan praktik TIDAK BISA akses health data jika belum punya practice place
- Endpoint create practice place: `POST /api/practice-places`

**Contoh Create Practice Place:**

```json
POST /api/practice-places
{
  "nama_praktik": "Praktek Bidan A",
  "village_id": "fdbc66ee-b684-4cb2-966a-e614fb1957d6",
  "alamat": "Jl. Contoh No. 123",
  "user_id": "ad0f65c3-9e01-4da7-a44e-889609b70d06"  // ID user bidan praktik
}
```

---

#### C. Create Bidan Desa

```json
{
  "full_name": "Bidan Desa Sukahaji",
  "email": "bidan.desa@example.com",
  "password": "password123",
  "phone_number": "081234567890",
  "address": "Desa Sukahaji",
  "position_user": "bidan_desa",
  "village_id": "fdbc66ee-b684-4cb2-966a-e614fb1957d6", // WAJIB!
  "role": "USER",
  "status_user": "ACTIVE"
}
```

**⚠️ PENTING untuk Bidan Desa:**

- `village_id` **WAJIB** diisi
- Village harus sudah ada di database (buat dulu via `POST /api/villages`)
- Bidan desa TIDAK BISA akses health data jika `village_id` NULL

---

#### D. Create Bidan Koordinator

```json
{
  "full_name": "Bidan Koordinator",
  "email": "bidan.koordinator@example.com",
  "password": "password123",
  "phone_number": "081234567890",
  "address": "Alamat Koordinator",
  "position_user": "bidan_koordinator",
  "role": "USER",
  "status_user": "ACTIVE"
}
```

**Catatan:** Bidan Koordinator TIDAK perlu `village_id` (bisa lihat semua data)

---

## 🏥 Village Management

### 1. List All Villages

**Endpoint:** `GET /api/villages`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "village_id": "fdbc66ee-b684-4cb2-966a-e614fb1957d6",
      "nama_desa": "SUKAHAJI",
      "created_at": "2026-02-07T15:09:45.782Z",
      "updated_at": "2026-02-07T15:09:45.782Z"
    }
  ]
}
```

### 2. Create Village (Admin Only)

**Endpoint:** `POST /api/villages`

**Request:**

```json
{
  "nama_desa": "SUKAHAJI"
}
```

---

## 🏥 Practice Place Management

### 1. Create Practice Place (Admin Only)

**Endpoint:** `POST /api/practice-places`

**Request:**

```json
{
  "nama_praktik": "Praktek Bidan A",
  "village_id": "fdbc66ee-b684-4cb2-966a-e614fb1957d6",
  "alamat": "Jl. Contoh No. 123",
  "user_id": "ad0f65c3-9e01-4da7-a44e-889609b70d06"
}
```

**⚠️ PENTING:**

- `user_id` harus user dengan `position_user = "bidan_praktik"`
- Satu user bidan praktik hanya bisa punya 1 practice place (one-to-one relation)

---

## 📊 Health Data Access Rules

### Akses Berdasarkan Role/Position:

| Role/Position         | Akses Data                                            | Keterangan                 |
| --------------------- | ----------------------------------------------------- | -------------------------- |
| **ADMIN**             | Semua data                                            | Tidak ada filter           |
| **Bidan Praktik**     | Data dari practice place sendiri                      | Harus punya practice place |
| **Bidan Desa**        | Data dari semua practice place di desa yang di-assign | Harus punya village_id     |
| **Bidan Koordinator** | Semua data (default: APPROVED saja)                   | Bisa filter status         |

### Endpoint Health Data:

```
GET /api/health-data
POST /api/health-data
GET /api/health-data/:data_id
PUT /api/health-data/:data_id
DELETE /api/health-data/:data_id
PUT /api/health-data/:data_id/revise
PATCH /api/health-data/:data_id/approve
PATCH /api/health-data/:data_id/reject
GET /api/health-data-pending
GET /api/health-data-rejected
```

**Semua endpoint memerlukan:**

```
Authorization: Bearer <TOKEN>
```

---

## 🔐 Authentication Flow

### 1. Login

**Endpoint:** `POST /api/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": "xxx",
      "full_name": "User Name",
      "email": "user@example.com",
      "role": "USER",
      "position_user": "bidan_praktik",
      "status_user": "ACTIVE"
    }
  }
}
```

### 2. Get Profile

**Endpoint:** `GET /api/profile`

**Headers:**

```
Authorization: Bearer <TOKEN>
```

---

## ⚠️ Common Errors & Solutions

### Error 1: "Anda tidak memiliki akses ke resource ini"

**Penyebab:**

- User dengan role USER mencoba akses endpoint yang hanya untuk ADMIN
- Contoh: `GET /api/users` (hanya ADMIN)

**Solusi:**

- Pastikan endpoint yang di-hit sesuai dengan role user

---

### Error 2: "Role tidak memiliki akses ke data kesehatan"

**Penyebab:**

- User tidak punya `position_user` yang valid
- User role USER tapi `position_user` NULL

**Solusi:**

- Update user untuk set `position_user` yang benar

---

### Error 3: Bidan Praktik dapat data kosong `[]`

**Penyebab:**

- User belum punya `practice_place`

**Solusi:**

- Buat practice place untuk user tersebut via `POST /api/practice-places`

---

### Error 4: Bidan Desa dapat data kosong `[]` atau error

**Penyebab:**

- User `village_id` masih NULL

**Solusi:**

- Update user untuk set `village_id` via `PUT /api/users/:user_id`

---

## 🔄 Update User Flow

### Scenario: User sudah dibuat tapi data kurang lengkap

**Endpoint:** `PUT /api/users/:user_id`

**Headers:**

```
Authorization: Bearer <ADMIN_TOKEN>
```

**Contoh 1: Update village_id untuk bidan desa**

```json
{
  "village_id": "fdbc66ee-b684-4cb2-966a-e614fb1957d6"
}
```

**Contoh 2: Update position_user**

```json
{
  "position_user": "bidan_desa",
  "village_id": "fdbc66ee-b684-4cb2-966a-e614fb1957d6"
}
```

---

## 🎯 Best Practices

1. **Urutan Pembuatan Data:**

   ```
   1. Buat Village dulu (jika belum ada)
   2. Buat User
   3. Jika user = bidan_praktik, buat Practice Place
   ```

2. **Validasi di Frontend:**
   - Validasi required fields sebelum submit
   - Disable submit button jika validasi gagal
   - Tampilkan error message yang jelas

3. **Error Handling:**
   - Tampilkan error message dari backend
   - Jangan hardcode error message di frontend

4. **User Experience:**
   - Jika create bidan_praktik, redirect ke form create practice place
   - Jika create bidan_desa, pastikan village sudah dipilih
   - Tampilkan loading state saat submit

---

## 📞 Contact Backend Team

Jika ada pertanyaan atau butuh endpoint tambahan, hubungi backend team.

**Endpoint Documentation:**

- API Base URL: `http://localhost:9090/api`
- All endpoints require `Content-Type: application/json`
- Protected endpoints require `Authorization: Bearer <TOKEN>`

---

**Last Updated:** 2026-02-07  
**Backend Version:** 1.0.0

---

## 🤰 Pemeriksaan Kehamilan Management

### 1. List Data Pemeriksaan

- **Endpoint:** `GET /api/pemeriksaan-kehamilan`
- **Query Params:**
  - `page`, `limit`: Pagination
  - `search`: Nama Pasien / NIK
  - `tanggal_start`, `tanggal_end`: Filter tanggal
  - `resti`: Filter Resiko Tinggi
  - `practice_id`: Filter Practice ID

### 2. Detail Data Pemeriksaan

- **Endpoint:** `GET /api/pemeriksaan-kehamilan/:id`

### 3. Create Data Pemeriksaan (Bidan Praktik)

- **Endpoint:** `POST /api/pemeriksaan-kehamilan`
- **Body Example:**

```json
{
  "practice_id": "UUID_PRAKTIK",
  "pasien_id": "UUID_PASIEN",
  "tanggal": "2024-02-14",
  "gpa": "G2P1A0",
  "umur_kehamilan": 24,
  "status_tt": "TT3",
  "jenis_kunjungan": "ANC",
  "td": "120/80",
  "lila": 23.5,
  "bb": 65,
  "resti": "RENDAH",
  "catatan": "Kondisi ibu baik",
  "ceklab_report": {
    "hiv": false,
    "hbsag": false,
    "sifilis": false,
    "hb": 12.5,
    "golongan_darah": "O"
  }
}
```

### 4. Update Data Pemeriksaan (Bidan Praktik)

- **Endpoint:** `PUT /api/pemeriksaan-kehamilan/:id`
- **Condition:** Hanya bisa jika status `REJECTED`.

### 5. Delete Data Pemeriksaan (Bidan Praktik)

- **Endpoint:** `DELETE /api/pemeriksaan-kehamilan/:id`
- **Condition:** Hanya bisa jika status `PENDING` atau `REJECTED`.

### 6. Verifikasi Data (Bidan Desa / Koordinator)

- **Endpoint:** `PATCH /api/pemeriksaan-kehamilan/:id/verify`
- **Body Example:**

```json
{
  "status": "APPROVED", // atau "REJECTED"
  "alasan": "Data kurang lengkap" // Wajib jika REJECTED
}
```

---

## 5. Modul Persalinan

### 1. List Data Persalinan

`GET /api/persalinan`

**Query Parameters:**

- `page`, `limit`: Pagination
- `search`: Nama Pasien / NIK
- `tanggal_start`, `tanggal_end`: Rentang tanggal partus
- `practice_id`: Filter by tempat praktik

### 2. Detail Persalinan

`GET /api/persalinan/:id`

**Response:**
Include object `keadaan_ibu_persalinan` dan `keadaan_bayi_persalinan`.

### 3. Create Data Persalinan (Bidan Praktik)

`POST /api/persalinan`

**Body:**

```json
{
  "practice_id": "UUID",
  "pasien_id": "UUID",
  "tanggal_partus": "2024-02-14T08:30:00Z",
  "gravida": 2,
  "para": 1,
  "abortus": 0,
  "vit_k": true,
  "hb_0": true,
  "vit_a_bufas": true,
  "catatan": "...",
  "keadaan_ibu": {
    "baik": true,
    "hap": false,
    "partus_lama": false,
    "pre_eklamsi": false,
    "hidup": true
  },
  "keadaan_bayi": {
    "pb": 48.5,
    "bb": 3200,
    "jenis_kelamin": "LAKI_LAKI",
    "asfiksia": false,
    "rds": false,
    "cacat_bawaan": false,
    "keterangan_cacat": "",
    "hidup": true
  }
}
```

### 4. Update Data Persalinan

`PUT /api/persalinan/:id`
Hanya bisa jika status `REJECTED`. Body sama dengan Create.

### 5. Delete Data Persalinan

`DELETE /api/persalinan/:id`
Hanya bisa jika status `PENDING` atau `REJECTED`.

### 6. Verifikasi Data

`PATCH /api/persalinan/:id/verify`

**Body:**

---

## 6. Modul Keluarga Berencana

### 1. List Data KB

`GET /api/keluarga-berencana`

**Query Parameters:**

- `page`, `limit`
- `search`, `tanggal_start`, `tanggal_end`, `practice_id`

### 2. Detail Data KB

`GET /api/keluarga-berencana/:id`

### 3. Create Data KB (Bidan Praktik)

`POST /api/keluarga-berencana`

**Body:**

```json
{
  "practice_id": "UUID",
  "pasien_id": "UUID",
  "tanggal_kunjungan": "2024-02-14",
  "jumlah_anak_laki": 1,
  "jumlah_anak_perempuan": 1,
  "at": false,
  "alat_kontrasepsi": "SUNTIK_3_BULAN",
  "keterangan": "Tidak ada keluhan"
}
```

### 4. Update Data KB

`PUT /api/keluarga-berencana/:id`
Hanya jika REJECTED.

### 5. Verifikasi Data

`PATCH /api/keluarga-berencana/:id/verify`json
{ "status": "APPROVED" }
// atau
{ "status": "REJECTED", "alasan": "Data tidak lengkap" }

````

---

## 7. Modul Imunisasi

### 1. List Data Imunisasi
`GET /api/imunisasi`

**Query Parameters:**
- `page`, `limit`
- `search`, `jenis_imunisasi`, `tanggal_start`, `tanggal_end`, `practice_id`

### 2. Detail Data Imunisasi
`GET /api/imunisasi/:id`

### 3. Create Data Imunisasi (Bidan Praktik)
`POST /api/imunisasi`

**Body:**
```json
{
  "practice_id": "UUID",
  "pasien_id": "UUID",
  "tgl_imunisasi": "2024-02-14",
  "berat_badan": 4.2,
  "suhu_badan": 36.6,
  "nama_orangtua": "Siti Aminah",
  "jenis_imunisasi": "BCG",
  "catatan": "Bayi sehat"
}
````

### 4. Update Data Imunisasi

`PUT /api/imunisasi/:id`
Hanya jika REJECTED.

### 5. Verifikasi Data

`PATCH /api/imunisasi/:id/verify`

---

## 8. Modul Master Pasien

### 1. List Data Pasien

`GET /api/pasien`

**Query Parameters:**

- `page`, `limit`
- `search`: Cari Nama / NIK

### 2. Detail Data Pasien

`GET /api/pasien/:id`

**Response:**
Mengembalikan data pasien LENGKAP dengan history:

- `pemeriksaan_kehamilan` (5 data terakhir)
- `persalinan` (5 data terakhir)
- `keluarga_berencana` (5 data terakhir)
- `imunisasi` (5 data terakhir)

### 3. Create Data Pasien

`POST /api/pasien`

**Body:**

```json
{
  "nik": "3201123456780001", // String (16 digit), Wajib Unik
  "nama": "Siti Aminah", // String
  "alamat_lengkap": "Jl. Mawar No. 10, Desa Maju", // Text Area
  "tanggal_lahir": "1995-05-20" // Date (YYYY-MM-DD)
}
```

### 4. Update Data Pasien

`PUT /api/pasien/:id`

### 5. Delete Data Pasien

`DELETE /api/pasien/:id`
Warning: Menghapus pasien akan menghapus seluruh data rekam medisnya (Cascade).
