export interface BacklogSubjectItem {
  id: string;
  subjectId: string;
  code: string;
  name: string;
  shortName: string;
  academicYear: 'FE' | 'SE' | 'TE' | 'BE';
  semester: number;
  pattern: string;
  department: string;
  resourceScope: 'all' | 'qb' | 'notes' | 'pyqs';
  targetClearanceSession: string;
  readiness: number;
  enrolledAt: string;
  priority: 'CRITICAL_ATKT' | 'HIGH' | 'MEDIUM';
}

const LOCAL_STORAGE_KEY = 'scoreedge_student_backlogs_v1';

export function getLocalBacklogs(): BacklogSubjectItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalBacklogs(items: BacklogSubjectItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota
  }
}

export function addLocalBacklog(item: Omit<BacklogSubjectItem, 'id' | 'enrolledAt'>): BacklogSubjectItem {
  const current = getLocalBacklogs();
  const newItem: BacklogSubjectItem = {
    ...item,
    id: `bklg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    enrolledAt: new Date().toISOString(),
  };
  const updated = [newItem, ...current.filter((b) => b.code !== item.code)];
  saveLocalBacklogs(updated);
  return newItem;
}

export function removeLocalBacklog(id: string): BacklogSubjectItem[] {
  const current = getLocalBacklogs();
  const updated = current.filter((b) => b.id !== id);
  saveLocalBacklogs(updated);
  return updated;
}
