#!/usr/bin/env node
/**
 * 仙本那潜水 ERP 系统 - 投产前全量 API 冒烟测试
 * 使用: node scripts/smoke-test.js [BASE_URL]
 * 默认: http://localhost:3000/api
 */
const BASE = process.argv[2] || 'http://localhost:3000/api';
const LOGIN = { username: 'admin', password: 'admin123' };

const results = { pass: 0, fail: 0, cases: [] };
let token = null;

function log(msg) {
  console.log(msg);
}

function ok(name, detail = '') {
  results.pass++;
  results.cases.push({ name, ok: true, detail });
  log(`  \x1b[32m✓\x1b[0m ${name}${detail ? ' ' + detail : ''}`);
}

function fail(name, detail = '') {
  results.fail++;
  results.cases.push({ name, ok: false, detail });
  log(`  \x1b[31m✗\x1b[0m ${name}${detail ? ' ' + detail : ''}`);
}

async function request(method, path, body = null, useToken = true) {
  const url = path.startsWith('http') ? path : `${BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow'
  };
  if (useToken && token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body && (method === 'POST' || method === 'PUT' || method === 'DELETE')) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    data = { _raw: text };
  }
  return { status: res.status, data };
}

async function run() {
  log('\n========== 仙本那潜水 ERP 系统 - 全量冒烟测试 ==========\n');
  log(`API 地址: ${BASE}`);
  log('');

  // ---- 1. 健康检查 ----
  log('--- 1. 健康检查 ---');
  try {
    const { status, data } = await request('GET', '/health', null, false);
    if (status === 200 && data && data.success) ok('GET /health');
    else fail('GET /health', `status=${status}`);
  } catch (e) {
    fail('GET /health', e.message);
  }

  // ---- 2. 登录 ----
  log('\n--- 2. 认证 ---');
  try {
    const { status, data } = await request('POST', '/auth/login', LOGIN, false);
    if (status === 200 && data && data.data && (data.data.accessToken || data.data.token)) {
      token = data.data.accessToken || data.data.token;
      ok('POST /auth/login');
    } else {
      fail('POST /auth/login', data?.message || `status=${status}`);
    }
  } catch (e) {
    fail('POST /auth/login', e.message);
  }

  if (!token) {
    log('\n未获取到 Token，后续需认证接口跳过。');
    printSummary();
    process.exit(results.fail > 0 ? 1 : 0);
  }

  // ---- 3. 公开报名（无需 Token） ----
  log('\n--- 3. 公开报名 (POST /enrollment/submit) ---');
  try {
    const enrollBody = {
      name_en: 'Test Guest',
      name_cn: '测试客人',
      gender: 'male',
      phone: '+60123456789',
      passport_number: 'TEST-SMOKE-' + Date.now(),
      course_type: 'OW',
      email: '',
      wechat: ''
    };
    const { status, data } = await request('POST', '/enrollment/submit', enrollBody, false);
    if (status === 201 && data && data.success) ok('POST /enrollment/submit');
    else fail('POST /enrollment/submit', data?.message || `status=${status}`);
  } catch (e) {
    fail('POST /enrollment/submit', e.message);
  }

  // ---- 4. 学员 CRUD ----
  log('\n--- 4. 学员 (客人) ---');
  let studentId = null;
  try {
    const list = await request('GET', '/students?limit=5');
    if (list.status === 200 && list.data && list.data.data) {
      const arr = list.data.data.students ?? list.data.data;
      if (Array.isArray(arr)) ok('GET /students'); else fail('GET /students', 'invalid response');
    } else fail('GET /students', `status=${list.status}`);
  } catch (e) {
    fail('GET /students', e.message);
  }

  try {
    const create = await request('POST', '/students', {
      name_en: 'Smoke Test',
      name_cn: '冒烟测试',
      gender: 'male',
      phone: '+60987654321',
      passport_number: 'SMOKE-' + Date.now(),
      learning_content: 'OW',
      status: 'pending'
    });
    if (create.status === 200 || create.status === 201) {
      const d = create.data?.data ?? create.data;
      studentId = d?.id ?? d?.student?.id;
      if (studentId) ok('POST /students (create)'); else ok('POST /students (create)', '(id not in response)');
    } else fail('POST /students', create.data?.message || `status=${create.status}`);
  } catch (e) {
    fail('POST /students', e.message);
  }

  if (studentId) {
    try {
      const up = await request('PUT', `/students/${studentId}`, { status: 'active' });
      if (up.status === 200 && up.data?.success !== false) ok('PUT /students/:id');
      else fail('PUT /students/:id', up.data?.message || `status=${up.status}`);
    } catch (e) {
      fail('PUT /students/:id', e.message);
    }
  }

  // ---- 5. 房间 ----
  log('\n--- 5. 房间 ---');
  let roomId = null;
  try {
    const list = await request('GET', '/rooms');
    if (list.status === 200 && Array.isArray(list.data?.data ?? list.data)) ok('GET /rooms');
    else fail('GET /rooms', `status=${list.status}`);
  } catch (e) {
    fail('GET /rooms', e.message);
  }

  try {
    const create = await request('POST', '/rooms', {
      room_number: 'SMOKE-' + Date.now(),
      floor: 'A',
      room_type: '大床',
      max_capacity: 2,
      status: 'available'
    });
    if (create.status === 200 || create.status === 201) {
      const d = create.data?.data ?? create.data;
      roomId = d?.id;
      if (roomId) ok('POST /rooms (create)'); else ok('POST /rooms (create)', '(id not in response)');
    } else fail('POST /rooms', create.data?.message || `status=${create.status}`);
  } catch (e) {
    fail('POST /rooms', e.message);
  }

  if (roomId && studentId) {
    try {
      const set = await request('POST', `/rooms/${roomId}/students`, { student_ids: [studentId] });
      if (set.status === 200 && set.data?.success !== false) ok('POST /rooms/:id/students');
      else fail('POST /rooms/:id/students', set.data?.message || `status=${set.status}`);
    } catch (e) {
      fail('POST /rooms/:id/students', e.message);
    }
  }

  // ---- 6. 员工 ----
  log('\n--- 6. 员工 ---');
  let staffId = null;
  try {
    const list = await request('GET', '/staff');
    if (list.status === 200 && Array.isArray(list.data?.data ?? list.data)) ok('GET /staff');
    else fail('GET /staff', `status=${list.status}`);
  } catch (e) {
    fail('GET /staff', e.message);
  }

  try {
    const create = await request('POST', '/staff', {
      name_en: 'Smoke Staff',
      name: '冒烟员工',
      role: 'instructor',
      phone: '+60111222333',
      status: 'active'
    });
    if (create.status === 200 || create.status === 201) {
      const d = create.data?.data ?? create.data;
      staffId = d?.id;
      if (staffId) ok('POST /staff (create)'); else ok('POST /staff (create)', '(id not in response)');
    } else fail('POST /staff', create.data?.message || `status=${create.status}`);
  } catch (e) {
    fail('POST /staff', e.message);
  }

  // ---- 7. 船只 ----
  log('\n--- 7. 船只 ---');
  let boatId = null;
  let createdBoatId = null;
  try {
    const list = await request('GET', '/boats');
    if (list.status === 200 && Array.isArray(list.data?.data ?? list.data)) ok('GET /boats');
    else fail('GET /boats', `status=${list.status}`);
  } catch (e) {
    fail('GET /boats', e.message);
  }

  try {
    const create = await request('POST', '/boats', {
      boat_number: 'SMOKE-' + Date.now(),
      boat_name: '冒烟测试船',
      boat_type: 'small',
      max_capacity: 10,
      status: 'available'
    });
    if (create.status === 200 || create.status === 201) {
      const d = create.data?.data ?? create.data;
      createdBoatId = d?.id;
      boatId = createdBoatId;
      if (boatId) ok('POST /boats (create)'); else ok('POST /boats (create)', '(id not in response)');
    } else fail('POST /boats', create.data?.message || `status=${create.status}`);
  } catch (e) {
    fail('POST /boats', e.message);
  }
  if (!boatId) {
    const boatsRes = await request('GET', '/boats');
    const arr = boatsRes.data?.data ?? boatsRes.data;
    if (Array.isArray(arr) && arr.length) boatId = arr[0].id;
  }

  // ---- 8. 行程（含多 DM/教练） ----
  log('\n--- 8. 行程 ---');
  let tripId = null;
  if (!boatId) {
    const boats = await request('GET', '/boats');
    const arr = boats.data?.data ?? boats.data;
    if (Array.isArray(arr) && arr.length) boatId = arr[0].id;
  }
  if (boatId) {
    try {
      const body = {
        trip_date: new Date().toISOString().slice(0, 10),
        destination: 'Mabul Island',
        boat_id: boatId,
        captain_id: null,
        dm_ids: staffId ? [staffId] : [],
        instructor_ids: staffId ? [staffId] : [],
        departure_time: '08:00:00',
        max_participants: 20,
        status: 'scheduled'
      };
      const create = await request('POST', '/trips', body);
      if (create.status === 200 || create.status === 201) {
        const d = create.data?.data ?? create.data;
        tripId = d?.id;
        if (tripId) ok('POST /trips (create, multi DM/instructor)'); else ok('POST /trips (create)', '(id not in response)');
      } else fail('POST /trips', create.data?.message || `status=${create.status}`);
    } catch (e) {
      fail('POST /trips', e.message);
    }
  } else {
    fail('POST /trips', 'no boat_id, skip');
  }

  try {
    const list = await request('GET', '/trips');
    if (list.status === 200 && Array.isArray(list.data?.data ?? list.data)) ok('GET /trips');
    else fail('GET /trips', `status=${list.status}`);
  } catch (e) {
    fail('GET /trips', e.message);
  }

  if (tripId && studentId) {
    try {
      const add = await request('POST', `/trips/${tripId}/participants`, { student_id: studentId });
      if (add.status === 201 || (add.status === 200 && add.data?.success !== false)) ok('POST /trips/:id/participants');
      else fail('POST /trips/:id/participants', add.data?.message || `status=${add.status}`);
    } catch (e) {
      fail('POST /trips/:id/participants', e.message);
    }

    try {
      const rem = await request('DELETE', `/trips/${tripId}/participants`, { student_id: studentId });
      if (rem.status === 200 && rem.data?.success !== false) ok('DELETE /trips/:id/participants');
      else fail('DELETE /trips/:id/participants', rem.data?.message || `status=${rem.status}`);
    } catch (e) {
      fail('DELETE /trips/:id/participants', e.message);
    }
  }

  if (tripId) {
    try {
      const up = await request('PUT', `/trips/${tripId}`, { status: 'scheduled', notes: 'smoke test' });
      if (up.status === 200 && up.data?.success !== false) ok('PUT /trips/:id');
      else fail('PUT /trips/:id', up.data?.message || `status=${up.status}`);
    } catch (e) {
      fail('PUT /trips/:id', e.message);
    }
  }

  // ---- 9. 装备（可选） ----
  log('\n--- 9. 装备 ---');
  try {
    const list = await request('GET', '/equipment');
    if (list.status === 200 && Array.isArray(list.data?.data ?? list.data)) ok('GET /equipment');
    else fail('GET /equipment', `status=${list.status}`);
  } catch (e) {
    fail('GET /equipment', e.message);
  }

  // ---- 10. 大屏/展示接口（公开） ----
  log('\n--- 10. 大屏/展示 (Display) ---');
  for (const path of ['/display/rooms-status', '/display/dashboard-stats', '/display/trips-by-island']) {
    try {
      const res = await request('GET', path, null, false);
      if (res.status === 200 && res.data !== undefined) ok(`GET ${path}`);
      else fail(`GET ${path}`, `status=${res.status}`);
    } catch (e) {
      fail(`GET ${path}`, e.message);
    }
  }

  // ---- 11. 用户信息 ----
  log('\n--- 11. 当前用户 ---');
  try {
    const me = await request('GET', '/auth/me');
    if (me.status === 200 && me.data?.data?.username) ok('GET /auth/me');
    else fail('GET /auth/me', me.data?.message || `status=${me.status}`);
  } catch (e) {
    fail('GET /auth/me', e.message);
  }

  // ---- 12. 清理（删除测试数据） ----
  log('\n--- 12. 清理测试数据 ---');
  if (tripId) {
    try {
      const del = await request('DELETE', `/trips/${tripId}`);
      if (del.status === 200) ok('DELETE /trips/:id (cleanup)'); else fail('DELETE /trips/:id', del.data?.message);
    } catch (e) {
      fail('DELETE /trips/:id', e.message);
    }
  }
  if (roomId) {
    try {
      const unset = await request('POST', `/rooms/${roomId}/students`, { student_ids: [] });
      if (unset.status === 200) ok('POST /rooms/:id/students [] (cleanup)');
    } catch (_) {}
    try {
      const del = await request('DELETE', `/rooms/${roomId}`);
      if (del.status === 200) ok('DELETE /rooms/:id (cleanup)'); else fail('DELETE /rooms/:id', del.data?.message);
    } catch (e) {
      fail('DELETE /rooms/:id', e.message);
    }
  }
  if (staffId) {
    try {
      const del = await request('DELETE', `/staff/${staffId}`);
      if (del.status === 200) ok('DELETE /staff/:id (cleanup)'); else fail('DELETE /staff/:id', del.data?.message);
    } catch (e) {
      fail('DELETE /staff/:id', e.message);
    }
  }
  if (createdBoatId) {
    try {
      const del = await request('DELETE', `/boats/${createdBoatId}`);
      if (del.status === 200) ok('DELETE /boats/:id (cleanup)'); else fail('DELETE /boats/:id', del.data?.message);
    } catch (e) {
      fail('DELETE /boats/:id', e.message);
    }
  }
  if (studentId) {
    try {
      const del = await request('DELETE', `/students/${studentId}`);
      if (del.status === 200) ok('DELETE /students/:id (cleanup)'); else fail('DELETE /students/:id', del.data?.message);
    } catch (e) {
      fail('DELETE /students/:id', e.message);
    }
  }

  printSummary();
  process.exit(results.fail > 0 ? 1 : 0);
}

function printSummary() {
  log('\n========== 测试结果汇总 ==========');
  log(`通过: ${results.pass}  失败: ${results.fail}`);
  if (results.fail > 0) {
    log('\n失败用例:');
    results.cases.filter(c => !c.ok).forEach(c => log(`  - ${c.name} ${c.detail || ''}`));
  }
  log('');
}

run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
