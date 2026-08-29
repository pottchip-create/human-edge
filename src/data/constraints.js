export const FIXED_CONSTRAINTS = {
  origin: '서울 공덕 본사',
  destination: '경기 양평',
  travelTime: '약 90분',
  schedule: '금~토 1박 2일',
  dateFixed: true,
  departureBase: '금요일 13:00',
  returnDeadline: '토요일 16:30',
  totalBudget: 120,
  budgetUnit: '만원',
  rooms: {
    total: 3,
    type: '2인 1실',
    initial: [
      { room: 1, members: ['김민준 대리', '박준혁 주임'] },
      { room: 2, members: ['이수진 과장', '최지원 대리'] },
      { room: 3, members: ['윤서현 과장', '장미래 대리'] }
    ]
  },
  pottery: {
    name: '물레 도자기 원데이 클래스',
    time: '금요일 16:00~18:00',
    participants: 6,
    cost: 24,
    costUnit: '만원',
    cancellable: false,
    timeChangeable: false
  }
}

export const INITIAL_PLAN = {
  day1: [
    { time: '13:00', activity: '서울 공덕 출발 (전세버스)' },
    { time: '14:30', activity: '양평 도착' },
    { time: '15:00', activity: '숙소 체크인' },
    { time: '16:00', activity: '물레 도자기 원데이 클래스 (전원 참여)' },
    { time: '18:00', activity: '클래스 종료' },
    { time: '19:00', activity: '저녁 식사' },
    { time: '21:00', activity: '자유 시간' },
  ],
  day2: [
    { time: '08:00', activity: '기상 및 조식' },
    { time: '09:30', activity: '팀 워크숍 세션' },
    { time: '12:00', activity: '중식' },
    { time: '13:30', activity: '마무리 및 체크아웃' },
    { time: '15:00', activity: '양평 출발' },
    { time: '16:30', activity: '서울 공덕 도착' },
  ],
  rooms: [
    { room: 1, members: ['김민준 대리', '박준혁 주임'] },
    { room: 2, members: ['이수진 과장', '최지원 대리'] },
    { room: 3, members: ['윤서현 과장', '장미래 대리'] }
],
  transport: '전세버스 (편도 약 90분)',
  estimatedCost: 120
}