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
قم بإنشاء أو تعديل الملف `.env.local` في جذر المشروع وضبط المتغيرات البيئية التالية فقط:

```env
# رابط مشروع Supabase الخاص بك
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# المفتاح العام (Anon Key) للواجهة الأمامية
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# رقم واتساب الإدارة لاستقبال رسائل الحجز والاستفسارات (بالصيغة الدولية دون علامة +، مثل: 201271759984)
NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER=201271759984

# البريد الإلكتروني المعتمد للمشرف (يجب أن يتطابق تماماً مع الحساب المسجل في Supabase Auth وجدول public.admins)
ADMIN_EMAIL=your-admin-email@example.com
```

> **ملاحظة أمنية:** لا تضع `SUPABASE_SERVICE_ROLE_KEY` في بيئة الإنتاج على Vercel؛ التطبيق مصمم وفق مبدأ الحد الأدنى من الصلاحيات (Least Privilege) ويعتمد على صلاحيات المستخدم الموثق وسياسات الـ RLS.

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
| `/list-your-property` | صفحة تقديم طلب إعلان سكن جديد لأصحاب الشقق |
| `/admin/login` | تسجيل دخول المشرف |
| `/admin/dashboard` | لوحة التحكم وإدارة السكنات وتغيير الحالة |
| `/admin/dashboard/submissions` | مراجعة واعتماد طلبات أصحاب الشقق |
| `/admin/dashboard/new` | إضافة سكن جديد من الإدارة مباشرة |
| `/admin/dashboard/[id]/edit` | تعديل بيانات سكن موجود |

---

## 🎨 دليل الهوية البصرية ونظام التصميم (Design System & AI Visual Guidelines)

> **تنبيه لأي نموذج ذكاء اصطناعي (AI) أو مطور مستقبلي:**  
> هذا القسم يمثل المرجع الصارم والوحيد لتوحيد الواجهات في منصة «سكن طلاب العريش». **يُحظر تماماً** استخدام القوالب الرمادية الجاهزة (Default Slate/Teal Templates) أو الخروج عن نظام الألوان والتكوين الموضح أدناه.

### 1. الفلسفة التصميمية (Design Philosophy)
- **الطابع الساحلي الدافئ (Warm Coastal Arish):** مستوحى من رمال شواطئ العريش، بحرها الهادئ، ونخيل سيناء. واجهة تجمع بين الدفء والعصرية لتشعر الطالب بالراحة والألفة.
- **عربي بالكامل (Strict RTL):** جميع النصوص والعناصر والمحاذاة تبدأ من اليمين لليسار مع استخدام خط `Cairo`.
- **مخصص للموبايل أولاً (Mobile-First):** خطوط واضحة، أزرار لمس مريحة (Touch Targets >= 40px)، وتقليل الحواف الحادة.

---

### 2. لوحة الألوان المعتمدة (Color Tokens)

| الاستخدام | الرمز اللوني (HEX / Tailwind) | الوصف والدلالة |
|---|---|---|
| **خلفية الصفحة العامة** | `#FBF9F5` | رملي فائق النعومة، مريح للعين ويبعد عن بياض الشاشات الصارخ |
| **خلفية الحاويات والترويسات** | `#FAF7F0` | رملي هادئ للجداول والبطاقات الفرعية وحقول الإدخال |
| **بطاقات المحتوى (Cards)** | `#FFFFFF` | أبيض ناصع مع حدود دافئة وظلال ناعمة |
| **الحدود والفواصل (Borders)** | `#EBE6DC` | حد دافئ يوحد كامل صفحات المشروع (بديل لـ `border-slate-200`) |
| **النصوص الرئيسية** | `#1C1917` (`text-stone-900`) | أسود حجري دافئ وعميق للعناوين |
| **النصوص الوصفية** | `#78716C` (`text-stone-500`) | رمادي دافئ للشروحات والمعلومات الإضافية |
| **الأزرق البحري (Primary)** | `#0369A1` (Hover: `#0284C7`) | لون البحر بالعريش؛ يُستخدم للأزرار الأساسية، العناوين البارزة، والروابط |
| **الأزرق الهادئ (Soft Sky)** | `bg-sky-50`, `border-sky-200` | شارات وعناصر منطقة المساعيد (جامعة سيناء) وخلفيات الأيقونات |
| **الأخضر النخيلي (Accent)** | `#166534` (Hover: `#15803D`) | لون النخيل السيناوي؛ حالة "متاح"، أزرار الاعتماد، وإحصائيات النجاح |
| **العنبر الدافئ (Warning)** | `#B45309` (`bg-amber-50`, `border-amber-200`) | حالة "متبقي سرير واحد"، والطلبات المعلقة قيد المراجعة |
| **الوردي المحمر (Danger)** | `#BE123C` (`bg-rose-50`, `border-rose-200`) | حالة "محجوز بالكامل"، زر الحذف، وشارات الرفض والتنبيهات |
| **لون الواتساب (WhatsApp)** | `#25D366` (Hover: `#20BD5A`) | مخصص حصرياً لأزرار التواصل بالحجز والواتساب |

---

### 3. قواعد التايبوجرافي (Typography Rules)
- **الخط المعتمد:** خط **Cairo** من Google Fonts لجميع النصوص والأزرار والعناوين.
- **العناوين الرئيسية (Page Titles):** `text-2xl` إلى `text-3xl` مع وزن `font-black text-stone-900`.
- **عناوين الأقسام (Section Headers):** `text-sm` إلى `text-base` مع وزن `font-black text-stone-900`.
- **النصوص والأوصاف (Body Text):** `text-xs` إلى `text-sm` مع وزن `font-medium text-stone-500`.
- **الأرقام والأكواد (Codes & Phones):** استخدام خط المونو `font-mono font-bold` مع تحديد اتجاه اليسار للأرقام `dir="ltr"`.

---

### 4. دليل المكونات والعناصر (Component Specifications)

#### أ. البطاقات والحاويات (Cards & Containers)
- النمط الموحد:
  ```tsx
  className="rounded-2xl border border-[#EBE6DC] bg-white shadow-2xs"
  ```
- الترويسات والفواصل الداخلية:
  ```tsx
  className="border-b border-[#EBE6DC] pb-4"
  ```

#### ب. حقول الإدخال والاختيار (Inputs & Selects)
- النمط الموحد:
  ```tsx
  className="h-10 sm:h-11 rounded-xl border-[#EBE6DC] bg-[#FAF7F0]/40 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/15 transition"
  ```

#### ج. الأزرار (Buttons Hierarchy)
1. **الزر الأساسي (Primary):**
   ```tsx
   className="bg-[#0369A1] hover:bg-[#0284C7] text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
   ```
2. **الزر الثانوي (Secondary / Outline):**
   ```tsx
   className="border-[#EBE6DC] bg-white hover:bg-[#FAF7F0] text-stone-700 font-semibold rounded-xl transition cursor-pointer"
   ```
3. **الزر الإيجابي / الاعتماد (Positive / Approve):**
   ```tsx
   className="bg-[#166534] hover:bg-[#15803D] text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
   ```
4. **زر الحذف والرفض (Destructive / Danger):**
   ```tsx
   className="border-rose-200 text-rose-700 hover:bg-rose-50 font-bold rounded-xl transition cursor-pointer"
   ```
5. **زر الواتساب (WhatsApp CTA):**
   ```tsx
   className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
   ```

#### د. الشارات (Badges & Statuses)
- **متاح (Available):** `bg-emerald-50 border border-emerald-200 text-[#166534] font-bold rounded-lg`
- **متبقي سرير واحد (One Bed Left):** `bg-amber-50 border border-amber-200 text-[#B45309] font-bold rounded-lg`
- **محجوز بالكامل (Booked):** `bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-lg`
- **المساعيد / جامعة سيناء:** `bg-sky-50 border border-sky-200 text-[#0369A1] font-bold rounded-lg`
- **الضاحية / جامعة العريش:** `bg-amber-50 border border-amber-200 text-amber-900 font-bold rounded-lg`

---

### 5. نبرة الصوت والمايكروكوبي (Tone of Voice & Microcopy)
- النبرة: ودودة، بسيطة، مصرية قريبة من الطالب وصاحب السكن في العريش.
- أمثلة معتمدة:
  - *"أهلاً بيك، ادخل بيانات حسابك للوصول للوحة تحكم سكن طلاب العريش"*
  - *"أعلن عن سكنك معنا واصل لآلاف الطلاب مباشرة بدون وسيط وبدون عمولة"*
  - *"تم استلام بيانات سكنك بنجاح! 🎉"*
  - *"تعديل بيانات السكن"* بدلاً من *"تعديل الكيان"*.
  - *"المساعيد (جامعة سيناء)"* و *"الضاحية (جامعة العريش)"*.

---

### 6. تعليمات صارمة لنماذج الذكاء الاصطناعي (Strict AI Rules)
1. ❌ **ممنوع نهائياً** استخدام فئات الألوان الرمادية الافتراضية مثل `border-slate-200`, `bg-slate-50`, `text-slate-500` في أي صفحة جديدة. استبدلها بـ `border-[#EBE6DC]`, `bg-[#FAF7F0]`, `text-stone-500`.
2. ❌ **ممنوع نهائياً** استخدام اللون التيل القديم `bg-teal-600` أو `bg-teal-700`. استبدلها بالأزرق البحري `#0369A1` للرئيسي والأخضر النخيلي `#166534` للعمليات الناجحة.
3. ❌ **ممنوع نهائياً** استخدام الحواف الحادة `rounded-md` في الكروت الكبيرة؛ استخدم دائماً `rounded-2xl` للبطاقات والحاويات، و `rounded-xl` للأزرار والمدخلات.
4. ✅ **احرص دائماً** على دعم الاتجاه العربي `dir="rtl"`، وتحديد `dir="ltr"` فقط للأرقام وكود السكن ورقم الهاتف.
5. ✅ **احرص دائماً** على الحفاظ على تجربة مستخدم سريعة وخفيفة على الهواتف الذكية.

