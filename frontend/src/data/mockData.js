export const mockRoutes = [
  {
    ID: 1,
    Name: '1号线 · 教学图书专线',
    Description: '连接教学楼与图书馆，途经南门、食堂、体育馆',
    Status: 1,
    CreatedAt: '2024-01-15T08:00:00Z',
    UpdatedAt: '2024-01-15T08:00:00Z',
  },
  {
    ID: 2,
    Name: '2号线 · 东西校区快线',
    Description: '东区宿舍至西区教学楼，途经实验楼、艺术楼',
    Status: 1,
    CreatedAt: '2024-01-15T08:00:00Z',
    UpdatedAt: '2024-01-15T08:00:00Z',
  },
  {
    ID: 3,
    Name: '3号线 · 地铁接驳线',
    Description: '地铁口往返校园中心，途经北门、行政楼',
    Status: 1,
    CreatedAt: '2024-01-15T08:00:00Z',
    UpdatedAt: '2024-01-15T08:00:00Z',
  },
  {
    ID: 4,
    Name: '4号线 · 夜间循环线',
    Description: '夜间校园循环线路，覆盖主要生活区',
    Status: 0,
    CreatedAt: '2024-01-15T08:00:00Z',
    UpdatedAt: '2024-01-15T08:00:00Z',
  },
]

export const mockSchedules = {
  1: [
    { ID: 1, RouteID: 1, DepartTime: '07:00', WeekDay: 1 },
    { ID: 2, RouteID: 1, DepartTime: '07:30', WeekDay: 1 },
    { ID: 3, RouteID: 1, DepartTime: '08:00', WeekDay: 1 },
    { ID: 4, RouteID: 1, DepartTime: '08:30', WeekDay: 1 },
    { ID: 5, RouteID: 1, DepartTime: '09:00', WeekDay: 1 },
    { ID: 6, RouteID: 1, DepartTime: '10:00', WeekDay: 1 },
    { ID: 7, RouteID: 1, DepartTime: '11:00', WeekDay: 1 },
    { ID: 8, RouteID: 1, DepartTime: '12:00', WeekDay: 1 },
    { ID: 9, RouteID: 1, DepartTime: '14:00', WeekDay: 1 },
    { ID: 10, RouteID: 1, DepartTime: '16:00', WeekDay: 1 },
    { ID: 11, RouteID: 1, DepartTime: '17:00', WeekDay: 1 },
    { ID: 12, RouteID: 1, DepartTime: '17:30', WeekDay: 1 },
    { ID: 13, RouteID: 1, DepartTime: '18:00', WeekDay: 1 },
    { ID: 14, RouteID: 1, DepartTime: '18:30', WeekDay: 1 },
    { ID: 15, RouteID: 1, DepartTime: '19:00', WeekDay: 1 },
    { ID: 16, RouteID: 1, DepartTime: '21:00', WeekDay: 1 },
  ],
  2: [
    { ID: 17, RouteID: 2, DepartTime: '06:50', WeekDay: 1 },
    { ID: 18, RouteID: 2, DepartTime: '07:20', WeekDay: 1 },
    { ID: 19, RouteID: 2, DepartTime: '07:50', WeekDay: 1 },
    { ID: 20, RouteID: 2, DepartTime: '08:20', WeekDay: 1 },
    { ID: 21, RouteID: 2, DepartTime: '09:30', WeekDay: 1 },
    { ID: 22, RouteID: 2, DepartTime: '11:00', WeekDay: 1 },
    { ID: 23, RouteID: 2, DepartTime: '13:00', WeekDay: 1 },
    { ID: 24, RouteID: 2, DepartTime: '15:00', WeekDay: 1 },
    { ID: 25, RouteID: 2, DepartTime: '16:50', WeekDay: 1 },
    { ID: 26, RouteID: 2, DepartTime: '17:20', WeekDay: 1 },
    { ID: 27, RouteID: 2, DepartTime: '17:50', WeekDay: 1 },
    { ID: 28, RouteID: 2, DepartTime: '18:50', WeekDay: 1 },
    { ID: 29, RouteID: 2, DepartTime: '20:00', WeekDay: 1 },
  ],
  3: [
    { ID: 30, RouteID: 3, DepartTime: '06:30', WeekDay: 0 },
    { ID: 31, RouteID: 3, DepartTime: '07:00', WeekDay: 0 },
    { ID: 32, RouteID: 3, DepartTime: '07:30', WeekDay: 0 },
    { ID: 33, RouteID: 3, DepartTime: '08:00', WeekDay: 0 },
    { ID: 34, RouteID: 3, DepartTime: '09:00', WeekDay: 0 },
    { ID: 35, RouteID: 3, DepartTime: '10:00', WeekDay: 0 },
    { ID: 36, RouteID: 3, DepartTime: '11:00', WeekDay: 0 },
    { ID: 37, RouteID: 3, DepartTime: '13:00', WeekDay: 0 },
    { ID: 38, RouteID: 3, DepartTime: '15:00', WeekDay: 0 },
    { ID: 39, RouteID: 3, DepartTime: '17:00', WeekDay: 0 },
    { ID: 40, RouteID: 3, DepartTime: '18:00', WeekDay: 0 },
    { ID: 41, RouteID: 3, DepartTime: '19:00', WeekDay: 0 },
    { ID: 42, RouteID: 3, DepartTime: '20:30', WeekDay: 0 },
    { ID: 43, RouteID: 3, DepartTime: '22:00', WeekDay: 0 },
  ],
  4: [
    { ID: 44, RouteID: 4, DepartTime: '19:00', WeekDay: 0 },
    { ID: 45, RouteID: 4, DepartTime: '20:00', WeekDay: 0 },
    { ID: 46, RouteID: 4, DepartTime: '21:00', WeekDay: 0 },
    { ID: 47, RouteID: 4, DepartTime: '22:00', WeekDay: 0 },
  ],
}

export const mockStops = {
  1: [
    { ID: 1, RouteID: 1, Name: '教学楼', OrderNum: 1 },
    { ID: 2, RouteID: 1, Name: '南门', OrderNum: 2 },
    { ID: 3, RouteID: 1, Name: '第一食堂', OrderNum: 3 },
    { ID: 4, RouteID: 1, Name: '体育馆', OrderNum: 4 },
    { ID: 5, RouteID: 1, Name: '图书馆', OrderNum: 5 },
  ],
  2: [
    { ID: 6, RouteID: 2, Name: '东区宿舍', OrderNum: 1 },
    { ID: 7, RouteID: 2, Name: '东门', OrderNum: 2 },
    { ID: 8, RouteID: 2, Name: '实验楼', OrderNum: 3 },
    { ID: 9, RouteID: 2, Name: '艺术楼', OrderNum: 4 },
    { ID: 10, RouteID: 2, Name: '西区教学楼', OrderNum: 5 },
  ],
  3: [
    { ID: 11, RouteID: 3, Name: '地铁口', OrderNum: 1 },
    { ID: 12, RouteID: 3, Name: '北门', OrderNum: 2 },
    { ID: 13, RouteID: 3, Name: '行政楼', OrderNum: 3 },
    { ID: 14, RouteID: 3, Name: '活动中心', OrderNum: 4 },
    { ID: 15, RouteID: 3, Name: '校园中心', OrderNum: 5 },
  ],
  4: [
    { ID: 16, RouteID: 4, Name: '南门', OrderNum: 1 },
    { ID: 17, RouteID: 4, Name: '学生公寓', OrderNum: 2 },
    { ID: 18, RouteID: 4, Name: '商业街', OrderNum: 3 },
    { ID: 19, RouteID: 4, Name: '图书馆', OrderNum: 4 },
    { ID: 20, RouteID: 4, Name: '南门', OrderNum: 5 },
  ],
}

export const weekDays = [
  { value: 0, label: '每天', color: 'bg-purple-100 text-purple-700' },
  { value: 1, label: '周一', color: 'bg-blue-100 text-blue-700' },
  { value: 2, label: '周二', color: 'bg-green-100 text-green-700' },
  { value: 3, label: '周三', color: 'bg-yellow-100 text-yellow-700' },
  { value: 4, label: '周四', color: 'bg-orange-100 text-orange-700' },
  { value: 5, label: '周五', color: 'bg-red-100 text-red-700' },
  { value: 6, label: '周六', color: 'bg-pink-100 text-pink-700' },
  { value: 7, label: '周日', color: 'bg-indigo-100 text-indigo-700' },
]

export const getWeekDayInfo = (weekDay) => {
  return weekDays.find(d => d.value === weekDay) || weekDays[0]
}
