# سكن طلاب العريش (Arish Student Housing) 🏠🎓

منصة متكاملة ومخصصة لطلاب الجامعات في مدينة العريش (جامعة سيناء - المساعيد، وجامعة العريش - الضاحية) للبحث عن سكنات طلابية مؤكدة بدون وسيط وبشكل مباشر عبر واتساب، مع لوحة تحكم كاملة للمشرف.

---

## 🚀 المميزات الرئيسية

### 1. واجهة الطالب (بدون تسجيل دخول):
- **تصميم مخصص للهواتف وموجه للعرب (RTL)** بخط Cairo الأنيق وسرعة فائقة.
- **تصفية دقيقة:** حسب المنطقة (المساعيد / الضاحية)، نوع السكن (شباب / بنات)، نوع الإيجار (سرير / غرفة / شقة كاملة)، وبحث بالاسم أو الكود.
- **عرض حالة السكن فوري:** متاح (Available) أخضر، باقي سرير واحد (One Bed Left) برتقالي، محجوز بالكامل (Booked) أحمر.
- **معرض صور تفاعلي:** استعراض صور الوحدة مع التنقل وسلايدر كامل.
- **فيديو يوتيوب مدمج:** معاينة السكن بالفيديو داخل الصفحة.
- **زر تواصل مباشر عبر واتساب:** يرسل رسالة تلقائية مجهزة تتضمن كود السكن، العنوان، ورابط السكن.

### 2. لوحة تحكم الإدارة (`/admin`):
- **حماية كاملة بالمسارات (Supabase Auth & Next.js Middleware).**
- **إحصائيات سريعة:** إجمالي الوحدات، المتاح، باقي سرير واحد، والمحجوز.
- **تغيير حالة السكن فورياً بنقرة واحدة (Inline Status Toggle)** من جدول الإدارة دون الحاجة لدخول صفحة التعديل.
- **إضافة وتعديل وحذف الوحدات:** رفع صور متعددة مباشرة إلى Supabase Storage (`property-images`)، تحديد المرافق، عدد الأسرّة، رابط الفيديو، إلخ.

---

## 🛠️ التقنيات المستخدمة

- **Next.js 16 (App Router, Turbopack, TypeScript)**
- **Tailwind CSS v4**
- **shadcn/ui & Radix UI Primitives**
- **Supabase (PostgreSQL Database, Auth, Storage, SSR)**
- **Lucide Icons**

---

## ⚙️ خطوات الإعداد والتشغيل

### 1. إعداد قاعدة البيانات في Supabase
1. أنشئ مشروعاً جديداً على [Supabase](https://supabase.com).
2. توجّه إلى **SQL Editor**، وقم بنسخ وتنفيذ محتويات ملف الترحيل الأمني الكامل:
   ```
   supabase/migration.sql
   ```
3. أضف بريدك الإلكتروني كمشرف في جدول `public.admins` عبر الـ SQL Editor:
   ```sql
   INSERT INTO public.admins (email) VALUES ('your-admin-email@example.com') ON CONFLICT DO NOTHING;
   ```
4. توجّه إلى **Authentication > Users** وأنشئ حساباً جديداً للمشرف بنفس البريد الإلكتروني وكلمة المرور.
5. توجّه إلى **Authentication > Providers > Email** وقم بإيقاف **Enable Sign Up** لضمان عدم إنشاء حسابات غير مصرح بها.

### 2. المتغيرات البيئية المطلوبة (Required Environment Variables)
قم بإنشاء أو تعديل الملف `.env.local` في جذر المشروع وضبط المتغيرات البيئية التالية:

```env
# رابط مشروع Supabase الخاص بك
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# المفتاح العام (Anon Key) للواجهة الأمامية
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# مفتاح الخدمة الداخلي (Service Role Key) لإدارة الـ Storage والصلاحيات العليا على الخادم
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# رقم واتساب الإدارة لاستقبال رسائل الحجز والاستفسارات (بالصيغة الدولية دون علامة +، مثل: 201271759984)
NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER=201271759984

# البريد الإلكتروني المعتمد للمشرف (يجب أن يتطابق مع الحساب المسجل في Supabase Auth وجدول public.admins)
ADMIN_EMAIL=your-admin-email@example.com
```

### 3. تشغيل خادم التطوير محلياً
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

---

## 📂 الصفحات والمسارات

| المسار | الوصف |
|---|---|
| `/` | الصفحة الرئيسية وتصفح السكنات والتصفية السريعة |
| `/property/[id]` | صفحة تفاصيل السكن، المعرض، الفيديو، وزر الواتساب |
| `/admin/login` | تسجيل دخول المشرف |
| `/admin/dashboard` | لوحة التحكم وإدارة السكنات وتغيير الحالة |
| `/admin/dashboard/new` | إضافة سكن جديد |
| `/admin/dashboard/[id]/edit` | تعديل بيانات سكن موجود |
