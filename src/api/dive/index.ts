import { http } from "@/utils/http";

const base = "";

/** 房间 */
export const roomApi = {
  list: (params?: Record<string, any>) =>
    http.get<{ success: boolean; data: any[] }>(`${base}/rooms`, { params }),
  get: (id: number) =>
    http.get<{ success: boolean; data: any }>(`${base}/rooms/${id}`),
  create: (data: any) =>
    http.post<{ success: boolean; data: any }>(`${base}/rooms`, data),
  update: (id: number, data: any) =>
    http.put<{ success: boolean; data: any }>(`${base}/rooms/${id}`, data),
  delete: (id: number) =>
    http.delete<{ success: boolean }>(`${base}/rooms/${id}`),
  setStudents: (id: number, studentIds: number[]) =>
    http.post<{ success: boolean; data: any }>(`${base}/rooms/${id}/students`, {
      student_ids: studentIds
    }),
  status: () =>
    http.get<{ success: boolean; data: { rooms: any[]; summary: any } }>(
      `${base}/rooms/status`
    )
};

/** 船只 */
export const boatApi = {
  list: (params?: Record<string, any>) =>
    http.get<{ success: boolean; data: any[] }>(`${base}/boats`, { params }),
  get: (id: number) =>
    http.get<{ success: boolean; data: any }>(`${base}/boats/${id}`),
  create: (data: any) =>
    http.post<{ success: boolean; data: any }>(`${base}/boats`, data),
  update: (id: number, data: any) =>
    http.put<{ success: boolean; data: any }>(`${base}/boats/${id}`, data),
  delete: (id: number) =>
    http.delete<{ success: boolean }>(`${base}/boats/${id}`)
};

/** 学员 */
export const studentApi = {
  list: (params?: Record<string, any>) =>
    http.get<{
      success: boolean;
      data: { students: any[]; total: number; page?: number; totalPages?: number };
    }>(`${base}/students`, { params }),
  get: (id: number) =>
    http.get<{ success: boolean; data: any }>(`${base}/students/${id}`),
  create: (data: any) =>
    http.post<{ success: boolean; data: any }>(`${base}/students`, data),
  update: (id: number, data: any) =>
    http.put<{ success: boolean; data: any }>(`${base}/students/${id}`, data),
  delete: (id: number) =>
    http.delete<{ success: boolean }>(`${base}/students/${id}`),
  enroll: (data: any) =>
    http.post<{ success: boolean; data: any }>(`${base}/students/enroll`, data),
  uploadPassport: (formData: FormData) =>
    http.post<{ success: boolean; data: any }>(`${base}/students/upload-passport`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
};

/** 行程 */
export const tripApi = {
  list: (params?: Record<string, any>) =>
    http.get<{ success: boolean; data: any[] }>(`${base}/trips`, { params }),
  get: (id: number) =>
    http.get<{ success: boolean; data: any }>(`${base}/trips/${id}`),
  create: (data: any) =>
    http.post<{ success: boolean; data: any }>(`${base}/trips`, data),
  update: (id: number, data: any) =>
    http.put<{ success: boolean; data: any }>(`${base}/trips/${id}`, data),
  delete: (id: number) =>
    http.delete<{ success: boolean }>(`${base}/trips/${id}`),
  addParticipant: (tripId: number, data: any) =>
    http.post<{ success: boolean; data: any }>(`${base}/trips/${tripId}/participants`, data),
  removeParticipant: (tripId: number, data: any) =>
    http.delete<{ success: boolean }>(`${base}/trips/${tripId}/participants`, {
      data
    } as any),
  tomorrow: () =>
    http.get<{ success: boolean; data: { groupedByDestination: any } }>(
      `${base}/trips/tomorrow`
    )
};

/** 员工 */
export const staffApi = {
  list: (params?: Record<string, any>) =>
    http.get<{ success: boolean; data: any[] }>(`${base}/staff`, { params }),
  get: (id: number) =>
    http.get<{ success: boolean; data: any }>(`${base}/staff/${id}`),
  create: (data: any) =>
    http.post<{ success: boolean; data: any }>(`${base}/staff`, data),
  update: (id: number, data: any) =>
    http.put<{ success: boolean; data: any }>(`${base}/staff/${id}`, data),
  delete: (id: number) =>
    http.delete<{ success: boolean }>(`${base}/staff/${id}`)
};

/** 课程（报名用） */
export const courseApi = {
  list: (params?: Record<string, any>) =>
    http.get<{ success: boolean; data: any[] }>(`${base}/courses`, { params })
};

/** 首页看板统计 */
export const displayApi = {
  dashboardStats: () =>
    http.get<{
      success: boolean;
      data: {
        todayTripParticipants: number;
        inHouseCount: number;
        studentCount: number;
        roomsAvailable: number;
        roomsTotal: number;
        roomsOccupied: number;
        roomOccupancyPercent: number;
        pendingEnrollmentsCount: number;
      };
    }>(`${base}/display/dashboard-stats`),
  dailyStats: () =>
    http.get<{
      success: boolean;
      data: {
        dailyStudents: Array<{ date: string; count: number }>;
        dailyTripParticipants: Array<{ date: string; count: number }>;
      };
    }>(`${base}/display/daily-stats`),
  /** 今日按岛屿分组的行程（含船员、学员），可传 date=YYYY-MM-DD 与页面显示日期一致 */
  tripsByIsland: (params?: { date?: string }) =>
    http.get<{ success: boolean; date: string; islands: Record<string, any[]> }>(
      `${base}/display/trips-by-island`,
      { params }
    ),
  /** 房间状态（大屏/看板用，按楼层含入住学员） */
  roomsStatus: () =>
    http.get<{
      success: boolean;
      statistics: { total: number; occupied: number; available: number; occupancyRate?: string };
      roomsByFloor: Record<string, any[]>;
    }>(`${base}/display/rooms-status`)
};
