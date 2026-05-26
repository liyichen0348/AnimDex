export interface AnimalRecord {
  id: string;
  created_at: string;
  title: string;
  scientific_name: string;
  image_url: string;
  match_rate: number;
  habitat: string;
  protection_status: string;
  fun_fact: string;
  size: string;
  diet: string;
  activity: string;
  location: string;
  category: string;
  is_saved: boolean;
  user_id?: string;
  user_name?: string;
  uploaded_image_url?: string;
}

export interface ProfileStats {
  total_species: number;
  total_saved: number;
  badge_count: number;
  user_id: string;
  user_title: string;
}

/**
 * 图像识别 API
 */
export async function identifyAnimal(base64Image: string, mimeType: string, userId?: string, userName?: string): Promise<AnimalRecord> {
  const response = await fetch('/api/identify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: base64Image, mimeType, userId, userName }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '识别失败，请稍后重试');
  }
  return response.json();
}

/**
 * 获取历史记录
 */
export async function getRecords(category?: string, search?: string, userId?: string): Promise<AnimalRecord[]> {
  const params = new URLSearchParams();
  if (category && category !== '全部') params.append('category', category);
  if (search) params.append('search', search);
  if (userId) params.append('user_id', userId);

  const response = await fetch(`/api/records?${params.toString()}`);
  if (!response.ok) {
    throw new Error('获取历史记录失败');
  }
  return response.json();
}

/**
 * 收藏记录
 */
export async function saveRecord(id: string): Promise<AnimalRecord> {
  const response = await fetch(`/api/records/${id}/save`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('保存收藏失败');
  }
  return response.json();
}

/**
 * 取消收藏
 */
export async function unsaveRecord(id: string): Promise<AnimalRecord> {
  const response = await fetch(`/api/records/${id}/unsave`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('取消收藏失败');
  }
  return response.json();
}

/**
 * 获取个人信息与数据统计
 */
export async function getProfileStats(userId?: string): Promise<ProfileStats> {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);

  const response = await fetch(`/api/stats?${params.toString()}`);
  if (!response.ok) {
    throw new Error('获取个人信息失败');
  }
  return response.json();
}

/**
 * 删除历史记录
 */
export async function deleteRecord(id: string): Promise<void> {
  const response = await fetch(`/api/records/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '删除失败，请重试');
  }
}
