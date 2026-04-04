# API cURL examples for gym project

> Base URL: `https://gym-five-blush.vercel.app`

---

## 🔐 Authentication Endpoints

### Register a new user
```bash
curl -X POST https://gym-five-blush.vercel.app/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret","userName":"John Doe"}'
```

### Login and obtain tokens
```bash
curl -X POST https://gym-five-blush.vercel.app/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@g.com","password":"123456"}'
```

### Refresh access token
```bash
curl -X POST https://gym-five-blush.vercel.app/users/refreshtoken \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

---
> **Protected routes:** include the header `Authorization: Bearer <TOKEN>`

# 🗂️ Resource Endpoints

## 💬 Inquiry routes

### Get all inquiries
```bash
curl -X GET https://gym-five-blush.vercel.app/inquiry/getAllInquiryDetails \
  -H "Authorization: Bearer <TOKEN>"
```

### Create / save an inquiry
```bash
curl -X POST https://gym-five-blush.vercel.app/inquiry/saveInquiryDetails \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Jane","email":"jane@example.com","mobileNumber":1234567890,"gender":"female","dateOfBirth":"1990-01-01","occupation":"student","packageType":"basic","followUpDate":"2026-02-01","remarks":"test"}'
```

### Delete an inquiry
```bash
curl -X DELETE https://gym-five-blush.vercel.app/inquiry/deleteInquiryDetail \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"inquiryId":"<INQUIRY_ID>"}'
```

## 👥 Member routes

### Get all members
```bash
curl -X GET https://gym-five-blush.vercel.app/members/getMemberDetails \
  -H "Authorization: Bearer <TOKEN>"
```

### Create / save a member
```bash
curl -X POST https://gym-five-blush.vercel.app/members/saveMemberDetails \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"memberNo":"M001","fullName":"Alice","email":"alice@example.com","mobileNumber":9876543210,"dateOfBirth":"1990-01-01","gender":"female","package":"<PACKAGE_ID>","packageStartDate":"2026-01-01","packageEndDate":"2026-12-31"}'
```

### Delete a member
```bash
curl -X DELETE https://gym-five-blush.vercel.app/members/deleteMemberDetail \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"memberId":"<MEMBER_ID>"}'
```

## 🛠️ MiscMaster routes

### Get records by header type array
```bash
curl -X POST https://gym-five-blush.vercel.app/miscMaster/getMiscMaster \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"headerTypes":["type1","type2"]}'
```

### Create / save a MiscMaster record
```bash
curl -X POST https://gym-five-blush.vercel.app/miscMaster/saveMiscMaster \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"headerType":"type1","displayValue":"Value"}'
```

### Delete a MiscMaster record
```bash
curl -X DELETE https://gym-five-blush.vercel.app/miscMaster/deleteMiscMaster \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"miscMasterId":"<ID>"}'
```

## � Package routes

### Get all packages
```bash
curl -X GET https://gym-five-blush.vercel.app/package/getPackageDetails \
  -H "Authorization: Bearer <TOKEN>"
```

### Create / save a package
```bash
curl -X POST https://gym-five-blush.vercel.app/package/savePackageDetails \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"packageName":"Gold","fee":99.99,"isActive":true}'
```

### Delete a package
```bash
curl -X DELETE https://gym-five-blush.vercel.app/package/deletePackageDetail \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"packageId":"<PACKAGE_ID>"}'
```

## 🧑‍💼 Staff routes

### Get all staff
```bash
curl -X GET https://gym-five-blush.vercel.app/staff/getStaffDetails \
  -H "Authorization: Bearer <TOKEN>"
```

### Create / save a staff record
```bash
curl -X POST https://gym-five-blush.vercel.app/staff/saveStaffDetails \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","mobile":"5551234567","role":"trainer"}'
```

### Delete a staff record
```bash
curl -X DELETE https://gym-five-blush.vercel.app/staff/deleteStaffDetail \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"staffId":"<STAFF_ID>"}'
```

---

## 📌 Miscellaneous

### Home / index route
```bash
curl https://gym-five-blush.vercel.app/
```
