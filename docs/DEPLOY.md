# 🚀 SoundWave Deployment Guide

Bu layihəni internetdə hamının istifadəsi üçün necə yerləşdirmək olar.

Layihə iki hissədən ibarətdir:
1. **Backend (Python)** - Musiqini yükləyən və emal edən tərəf. (Railway istifadə edəcəyik)
2. **Frontend (HTML/JS)** - İstifadəçinin gördüyü sayt. (Vercel istifadə edəcəyik)

---

## Addım 1: GitHub Repozitoriyası

Kodları GitHub-a yükləyin (əgər etməmisinizsə).
1. GitHub-da yeni repo yaradın.
2. Kodları ora push edin.

---

## Addım 2: Backend (Railway)

Python kodunu serverə qoymalıyıq.

1. [Railway.app](https://railway.app) saytına daxil olun və GitHub ilə giriş edin.
2. **+ New Project** düyməsini basın.
3. **Deploy from GitHub repo** seçin və repozitoriyanızı seçin.
4. **Deploy Now** basın.
5. Railway avtomatik `Procfile` və `requirements.txt` fayllarını görüb quraşdıracaq.
6. Deploy bitdikdən sonra:
   - **Settings** bölməsinə keçin.
   - **Networking** altında **Generate Domain** basın.
   - Sizə uzun bir link verəcək (məsələn: `soundwave-production.up.railway.app`).
   - ⚠️ **Bu linki kopyalayın!**

---

## Addım 3: Konfiqurasiya

İndi frontend-ə deməliyik ki, backend haradadır.

1. Layihənizdə `config.js` faylını açın.
2. Railway-dən aldığınız linki ora yazın və şərhi silin:

```javascript
window.API_BASE = 'https://sizin-railway-linkiniz.up.railway.app/api';
```

3. Dəyişikliyi yadda saxlayın və GitHub-a yenidən **push** edin.

---

## Addım 4: Frontend (Vercel)

İndi saytın özünü internetə qoyaq.

1. [Vercel.com](https://vercel.com) saytına daxil olun.
2. **Add New...** -> **Project** seçin.
3. GitHub reponuzu seçin və **Import** basın.
4. **Deploy** düyməsini basın.
5. 1 dəqiqə sonra saytınız `sizin-layihe.vercel.app` ünvanında aktiv olacaq!

---

🎉 **Təbriklər!** İndi dostlarınız həmin Vercel linkinə daxil olub musiqi yükləyə bilərlər. Backend Railway üzərində işləyəcək.
