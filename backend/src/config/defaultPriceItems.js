module.exports = [
  // 固定附加费
  {
    code: 'SURCHARGE_FUEL_DAILY',
    category: 'surcharge',
    name_cn: '出海燃油附加费',
    name_en: 'Fuel Surcharge (All Trip Types)',
    unit: 'person/day',
    currency: 'MYR',
    price_non_malaysian: 30,
    price_malaysian: 30,
    notes: '所有出海类型都收取，每人每天 RM30',
    sort_order: 1,
    is_fuel_surcharge: true,
    apply_all_trip_types: true
  },

  // 课程
  { code: 'COURSE_OW', category: 'course', name_cn: '开放水域潜水员', name_en: 'PADI Open Water', unit: 'person', currency: 'MYR', price_non_malaysian: 1600, price_malaysian: 1600, sort_order: 100 },
  { code: 'COURSE_AOW', category: 'course', name_cn: '进阶开放水域潜水员', name_en: 'PADI Advanced Open Water', unit: 'person', currency: 'MYR', price_non_malaysian: 1300, price_malaysian: 1300, sort_order: 101 },
  { code: 'COURSE_OW_AOW', category: 'course', name_cn: '开放水域+进阶开放水域', name_en: 'PADI Open Water + Advanced Open Water', unit: 'person', currency: 'MYR', price_non_malaysian: 2900, price_malaysian: 2900, sort_order: 102 },
  { code: 'COURSE_REACTIVATE', category: 'course', name_cn: '再激活课程', name_en: 'PADI ReActivate Scuba Refresher Program', unit: 'person', currency: 'MYR', price_non_malaysian: 200, price_malaysian: 200, sort_order: 103 },
  { code: 'COURSE_EFR', category: 'course', name_cn: 'EFR紧急第一反应', name_en: 'PADI Emergency First Response', unit: 'person', currency: 'MYR', price_non_malaysian: 500, price_malaysian: 500, sort_order: 104 },
  { code: 'COURSE_RESCUE', category: 'course', name_cn: '救援潜水员', name_en: 'PADI Rescue Diver', unit: 'person', currency: 'MYR', price_non_malaysian: 1300, price_malaysian: 1300, sort_order: 105 },
  { code: 'COURSE_TECH40', category: 'course', name_cn: 'Tec 40', name_en: 'Tec 40', unit: 'person', currency: 'MYR', price_non_malaysian: 2400, price_malaysian: 2400, sort_order: 106 },
  { code: 'COURSE_TECH45', category: 'course', name_cn: 'Tec 45', name_en: 'Tec 45', unit: 'person', currency: 'MYR', price_non_malaysian: 2400, price_malaysian: 2400, sort_order: 107 },
  { code: 'COURSE_TECH50', category: 'course', name_cn: 'Tec 50', name_en: 'Tec 50', unit: 'person', currency: 'MYR', price_non_malaysian: 2400, price_malaysian: 2400, sort_order: 108 },
  { code: 'COURSE_TECH40_50_PACKAGE', category: 'course', name_cn: 'Tec 40-50 配套', name_en: 'Tec 40-50 Package', unit: 'person', currency: 'MYR', price_non_malaysian: 6800, price_malaysian: 6800, sort_order: 109 },
  { code: 'COURSE_TECH65', category: 'course', name_cn: 'Tec 65', name_en: 'Tec 65', unit: 'person', currency: 'MYR', price_non_malaysian: 3800, price_malaysian: 3800, sort_order: 110 },
  { code: 'COURSE_TECH100', category: 'course', name_cn: 'Tec 100', name_en: 'Tec 100', unit: 'person', currency: 'MYR', price_non_malaysian: 3800, price_malaysian: 3800, sort_order: 111 },
  { code: 'COURSE_TECH65_100_PACKAGE', category: 'course', name_cn: 'Tec 65-100 配套', name_en: 'Tec 65-100 Package', unit: 'person', currency: 'MYR', price_non_malaysian: 6800, price_malaysian: 6800, sort_order: 112 },

  // 出海/活动
  { code: 'ACT_FUN_DIVE_MABUL', category: 'activity', name_cn: '欢乐潜（马布路线）', name_en: 'Fun Dive - Mabul Route', unit: 'person/day', currency: 'MYR', price_non_malaysian: 360, price_malaysian: 310, sort_order: 200 },
  { code: 'ACT_FUN_DIVE_MATAKING', category: 'activity', name_cn: '欢乐潜（马达京路线）', name_en: 'Fun Dive - Mataking Route', unit: 'person/day', currency: 'MYR', price_non_malaysian: 360, price_malaysian: 350, sort_order: 201 },
  { code: 'ACT_FUN_DIVE_SIPADAN', category: 'activity', name_cn: '欢乐潜（诗巴丹路线）', name_en: 'Fun Dive - Sipadan Route', unit: 'person/day', currency: 'MYR', price_non_malaysian: 1200, price_malaysian: 950, sort_order: 202 },
  { code: 'ACT_DSD', category: 'activity', name_cn: '体验潜', name_en: 'Discovery Scuba Diving', unit: 'person/day', currency: 'MYR', price_non_malaysian: 360, price_malaysian: 350, sort_order: 203 },
  { code: 'ACT_SNORKEL', category: 'activity', name_cn: '浮潜', name_en: 'Snorkeling', unit: 'person/day', currency: 'MYR', price_non_malaysian: 180, price_malaysian: 160, sort_order: 204 },

  // 住宿
  { code: 'ACC_SEMPORNA_HOTEL', category: 'accommodation', name_cn: '仙本那镇酒店', name_en: 'Semporna Hotel', unit: 'room/night', currency: 'MYR', price_non_malaysian: 150, price_malaysian: 150, sort_order: 300 },
  { code: 'ACC_MABUL_WATER_CHALET', category: 'accommodation', name_cn: '马布岛水屋', name_en: 'Mabul Water Chalet', unit: 'room/night', currency: 'MYR', price_non_malaysian: 360, price_malaysian: 360, sort_order: 301 },

  // 接驳
  { code: 'TRANSFER_AIRPORT_CARPOOL', category: 'transfer', name_cn: '机场拼车', name_en: 'Airport Shuttle - Carpool', unit: 'person/trip', currency: 'MYR', price_non_malaysian: 30, price_malaysian: 30, sort_order: 400 },
  { code: 'TRANSFER_AIRPORT_SEDAN', category: 'transfer', name_cn: '机场轿车接驳（4座）', name_en: 'Airport Shuttle - Sedan (4 seats)', unit: 'trip', currency: 'MYR', price_non_malaysian: 120, price_malaysian: 120, sort_order: 401 },
  { code: 'TRANSFER_AIRPORT_VAN', category: 'transfer', name_cn: '机场商务车接驳（8座）', name_en: 'Airport Shuttle - Van (8 seats)', unit: 'trip', currency: 'MYR', price_non_malaysian: 150, price_malaysian: 150, sort_order: 402 }
];
