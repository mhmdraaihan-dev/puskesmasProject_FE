# API Documentation - Puskesmas Project (SiBidan)

Dokumentasi ini mencakup seluruh endpoint yang tersedia untuk integrasi Frontend.

## Base URL

`http://localhost:9090/api`

## Authentication

Hampir semua endpoint membutuhkan header `Authorization: Bearer <accessToken>`.

---

## 1. User Management

### 1.1 List Users

- **URL**: `/api/users`
- **Method**: `GET`
- **Access**: All Authenticated Users (untuk keperluan dropdown/list).

### 1.2 Get Detail User

- **URL**: `/api/users/:user_id`
- **Method**: `GET`
- **Access**: All Authenticated Users.

### 1.3 Update Status User (Admin)

- **URL**: `/api/users/:user_id/status`
- **Method**: `PATCH`
- **Access**: ADMIN
- **Body**: `{ "status_user": "ACTIVE" | "INACTIVE" }`

### 1.4 Change Password

- **URL**: `/api/users/:user_id/password`
- **Method**: `PATCH`
- **Access**: User yang bersangkutan saja.
- **Body**: `{ "old_password": "...", "new_password": "..." }`

---

## 2. Dashboard

### 2.1 Pending Tasks (Verifikasi)

Mengambil daftar tugas yang menunggu persetujuan (PENDING) dari 4 modul pelayanan.

- **URL**: `/api/dashboard/pending-tasks`
- **Method**: `GET`
- **Access**: Bidan Desa (filter desa), Bidan Koordinator (all).

### 2.2 Stats (Akumulasi Data)

Mengambil angka statistik total dan bulan ini.

- **URL**: `/api/dashboard/stats`
- **Method**: `GET`
- **Access**: Semua Role (Data terfilter otomatis sesuai wilayahnya).

### 2.3 Village Performance (DEPRECATED)

> **Note**: Endpoint ini sudah dihapus di backend. Gunakan List Module API dengan filter (Lihat Bagian 6).

### 2.4 Approved Records Feed (DEPRECATED)

> **Note**: Endpoint ini sudah dihapus di backend. Gunakan List Module API dengan filter (Lihat Bagian 6).

---

## 3. Pelayanan Kesehatan (4 Modul Utama)

Modul: `pemeriksaan-kehamilan`, `persalinan`, `keluarga-berencana`, `imunisasi`.

### 3.1 List Data & Rekapitulasi

Mengambil data pelayanan. Mendukung filter pencarian dan rekapitulasi laporan.

- **URL**: `/api/{modul}`
- **Method**: `GET`
- **Query Parameters**:
  - `status_verifikasi`: `PENDING`, `APPROVED`, `REJECTED` (Filter status).
  - `month`: `01` - `12` (Filter bulan laporan).
  - `year`: `2024` - `2027` (Filter tahun laporan).
  - `limit`: Jumlah data per halaman.
- **Access**: Otomatis terfilter sesuai wilayah tugas user.

Contoh untuk Laporan Bulanan:
`GET /api/pemeriksaan-kehamilan?status_verifikasi=APPROVED&month=02&year=2026`

### 3.2 Create Data (Inputter)

- **URL**: `/api/{modul}`
- **Method**: `POST`
- **Access**: Bidan Praktik.
- **Note**: `practice_id` otomatis terisi oleh backend dari data user yang login.

### 3.2 Update Data (Revision)

- **URL**: `/api/{modul}/:id`
- **Method**: `PUT`
- **Condition**: Hanya bisa jika status = `REJECTED`. Setelah disave, status otomatis balik jadi `PENDING`.

### 3.3 Verify Data (Approver)

- **URL**: `/api/{modul}/:id/verify`
- **Method**: `PATCH`
- **Access**: Bidan Desa / Koordinator.
- **Body**:

```json
{
  "status": "APPROVED" | "REJECTED",
  "alasan": "Wajib diisi jika REJECTED"
}
```

---

## 4. Master Data

### 4.1 Pasien

- **URL**: `/api/pasien`
- **Method**: `GET`, `POST`, `PUT`, `DELETE`
- **Note**: `GET /api/pasien/:id` mengembalikan data pasien beserta 5 histori medis terakhir dari tiap modul.

### 4.2 Wilayah (Village)

- **URL**: `/api/villages`
- **Method**: `GET`

### 4.3 Tempat Praktik

- **URL**: `/api/practice-places`
- **Method**: `GET`, `POST`, `PUT`
- **Note**: Tempat Praktik menghubungkan User (Bidan Praktik) dengan Desa.

---

## 5. Village Access Control (Security)

Aplikasi menerapkan penguncian data berdasarkan wilayah (Desa).

- **ADMIN & Bidan Koordinator**: Memiliki akses ke **seluruh desa**.
- **Bidan Desa**: Hanya bisa mengakses/verifikasi data di **Desa yang ditugaskan**.
- **Bidan Praktik**: Hanya bisa mengakses/input data di **Tempat Praktik (Desa) miliknya**.
- **Midwife Unassigned**: Jika user belum di-assign ke Desa atau Tempat Praktik, maka akses ke data kesehatan (Pasien, Kehamilan, dll) akan **DIBLOKIR** sama sekali.
