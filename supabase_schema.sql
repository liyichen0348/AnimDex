-- AnimDex Supabase Database Schema

-- 创建 records 表用于保存识别记录
create table if not exists records (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,               -- 物种名称 (例如: 小熊猫)
  scientific_name text not null,     -- 学名 (例如: Ailurus fulgens)
  image_url text not null,           -- 识别图片的 URL 或者是 Base64 字符串
  match_rate integer not null,       -- 匹配度 (例如: 98)
  habitat text not null,             -- 栖息地 (例如: 森林/高山)
  protection_status text not null,   -- 保护现状 (例如: 濒危)
  fun_fact text not null,            -- 趣味科普
  size text not null,                -- 体型 (例如: 50-64cm)
  diet text not null,                -- 食性 (例如: 杂食)
  activity text not null,            -- 活跃度 (例如: 夜行)
  location text not null,            -- 发现地点 (例如: 中国，四川省，横断山脉地区)
  category text not null,            -- 物种分类 (例如: 哺乳类, 鸟类, 昆虫, 其他)
  is_saved boolean default false not null -- 是否已加入收藏
);

-- 创建索引以提高按类别和名称搜索时的性能
create index if not exists records_category_idx on records(category);
create index if not exists records_title_idx on records(title);

-- 插入一些初始的 Mock 数据，使用户第一次打开时就有内容展示
insert into records (title, scientific_name, image_url, match_rate, habitat, protection_status, fun_fact, size, diet, activity, location, category, is_saved)
values 
('家猫', 'Felis catus', 'https://lh3.googleusercontent.com/aida-public/AB6AXuADJIn8Ms5KF2msh9iPukaKQMWbBJL0bLVbA9aY5_ATljeJ8HRsmgVeTfIpIDKDF365nIISRHUNiNCrwtzJ6t6IlwEgyKQX-pLgfw4Eexy8uh0aN5cI8Mi5k1LmoQvF1EYaLd5KnfPIivaSjkfItf0ALsor_-9X2MFmI6jVzmjoV2KUgGripl13tEltcA0-4hN1mv3_6bqJTuzuoGsbm3g3A7C-TuQ-R0MzHvIzndtbJoRH0OGjmMoGhjKe7Y1IjHe3U1q3qxOOM2_1', 99, '人类居住区', '无危', '猫的身体非常灵活，拥有优秀的平衡感和夜视能力。它们是高度特化的捕食者。', '30-46cm', '肉食', '晨昏性/夜行', '全球广泛分布', '哺乳类', false),
('比格犬', 'Canis lupus familiaris', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCV5iXc10zOG166fl3p7nypWMMhi95X9csmjT2ecxZCQGXs5M3DUsmp34eGDFY2hr0YC1JC2TznXm67Waut7qiv5nsfLjjSA6Ohnp-4jLynbjarkVr_7WBuDIrcB02LBE7fqsGtNHxruCCy1pAcP_Ei58i7MHeaRUBLLqwWUPV9PnSkhFNmFugoG5LaBJlhI-9KrvFBlhYMBYz7DmHJTqm1JZ34wNAqdDdG_i3gBCYQVbaBzYR59CsOdbGEF2m5LIiMsdVL7y6o4EL', 95, '人类居住区', '无危', '比格犬是古老的猎犬品种，嗅觉极其敏锐，常被用作检疫犬，同时性格温顺、活泼。', '33-41cm', '杂食', '日行', '起源于英国', '哺乳类', true),
('黑脉金斑蝶', 'Danaus plexippus', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfGBfGNYhqSHg7l-NU7Ng_NvfWU1fnz0GFcaUjFKzPEjWawd_WJ0Q5Ld-GPTYukqYQ07mNM6HCvhuYMJa1ed0SZj8PTbGvQcntnRjtkOKXATCMKFc6_N38DcL4Az9GOr3_1uF1gIzzF8ByUsCYypoEIVU3f-1xrsiicN_WgtAUz-d8n_MajPn4l7cwajsydsLf-UPHgsG8HMYPjLGyg9DHQCrg5B-0pTI8lUoHfVpzYHqeZPvgZ8SwYwwQo8N_-WMEcrNDcgRuK0Y-', 98, '美洲开阔地带', '易危', '黑脉金斑蝶是著名的迁徙昆虫，每年秋季数以百万计的个体会从北美洲迁徙至墨西哥越冬。', '8.9-10.2cm (翼展)', '植食 (花蜜)', '日行', '北美洲至墨西哥', '昆虫', true),
('红松鼠', 'Sciurus vulgaris', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKt_yJpYYyfRHaexyO2Y3GREvJ4NLRG5SFJwMfBMjp8ohw3ACC0ReCZqHmGZkWwWnpVRXbVcVmFEaArjn47HpDEmIqs1WTeXEtt8Gclrho1kPA_K_9TYwKqZoZlYNA2bfTbEgUtEEwvwIzGr9ACpy6lYYsa9vZnZSs30ErY_neLjXbX-NfbVVyuLI8eb-3PidXRSx4hEK6VaXnYAsrzisWZxE9du22aQG2RiB7BPdE6TirNos92cJ_8nXI8Ge4YghqBnmCY2qDngkT', 96, '针叶林/落叶林', '无危', '红松鼠会在树洞或树杈上建造球形的巢穴。它们喜欢储存松果和坚果以备冬季食用。', '19-23cm', '杂食', '日行', '欧亚大陆温带地区', '哺乳类', false);

-- 【重要】关闭 records 表的 RLS (行级安全策略)
-- Supabase 默认对新表启用 RLS。如果不关闭它或未创建 Policy，匿名 API 插入记录时会抛出 42501 (violates row-level security) 错误，导致历史记录保存失败。
alter table records disable row level security;

-- 若您的 records 表此前已建立，请在 Supabase 的 SQL Editor 中执行以下升级脚本以支持管理后台查看上传用户：
-- alter table records add column if not exists user_id text default '8942371' not null;
-- alter table records add column if not exists user_name text default '自然探索者' not null;

-- 升级脚本：增加 uploaded_image_url 字段以保存实拍原图
alter table records add column if not exists uploaded_image_url text;

