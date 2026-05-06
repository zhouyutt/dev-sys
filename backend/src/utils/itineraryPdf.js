const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

const TEMPLATE_PATH = path.join(__dirname, '../templates/itinerary-template.pdf');
const CLEAN_TEMPLATE_PATH = path.join(__dirname, '../templates/itinerary-template-clean-page1.pdf');
const ARIAL_PATH = path.join(__dirname, '../templates/fonts/Arial.ttf');
const ARIAL_BOLD_PATH = path.join(__dirname, '../templates/fonts/Arial-Bold.ttf');
const ARIAL_UNICODE_PATH = path.join(__dirname, '../templates/fonts/Arial-Unicode.ttf');

function safeName(raw) {
  return String(raw || '')
    .replace(/[^\w\u4e00-\u9fa5\- ]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

function toMoney(v) {
  return Number(v || 0).toFixed(2);
}

function toDatePart(input) {
  const date = input ? new Date(input) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function formatHumanDate(input) {
  const date = input ? new Date(input) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return 0;
  const diff = Math.round((outDate.getTime() - inDate.getTime()) / (24 * 60 * 60 * 1000));
  return Math.max(0, diff);
}

function addDays(dateInput, offsetDays) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';
  date.setDate(date.getDate() + offsetDays);
  return formatHumanDate(date);
}

function toSafeText(value, forceAscii = false) {
  const raw = String(value == null ? '' : value).replace(/\r?\n/g, ' ');
  if (!forceAscii) return raw.trim();
  return raw.replace(/[^\x20-\x7E]/g, ' ').replace(/\s+/g, ' ').trim();
}

function drawTopText(page, text, x, top, opts = {}) {
  const size = opts.size || 9;
  const pageHeight = page.getHeight();
  const y = pageHeight - top - size;
  page.drawText(toSafeText(text, opts.forceAscii), {
    x,
    y,
    size,
    font: opts.font,
    color: opts.color || rgb(0, 0, 0),
    maxWidth: opts.maxWidth,
    lineHeight: opts.lineHeight || (size + 2)
  });
}

function clearTopRect(page, x, top, width, height) {
  const pageHeight = page.getHeight();
  page.drawRectangle({
    x,
    y: pageHeight - top - height,
    width,
    height,
    color: rgb(1, 1, 1)
  });
}

function drawTopRectBorder(page, x, top, width, height) {
  const pageHeight = page.getHeight();
  page.drawRectangle({
    x,
    y: pageHeight - top - height,
    width,
    height,
    borderColor: rgb(0.15, 0.15, 0.15),
    borderWidth: 1
  });
}

function drawTopLine(page, x1, x2, top) {
  const pageHeight = page.getHeight();
  const y = pageHeight - top;
  page.drawLine({
    start: { x: x1, y },
    end: { x: x2, y },
    thickness: 1,
    color: rgb(0.15, 0.15, 0.15)
  });
}

async function ensureCleanTemplate() {
  if (fs.existsSync(CLEAN_TEMPLATE_PATH)) return CLEAN_TEMPLATE_PATH;
  if (!fs.existsSync(TEMPLATE_PATH)) return TEMPLATE_PATH;

  const templateBytes = fs.readFileSync(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page1 = pdfDoc.getPages()[0];
  const pageHeight = page1.getHeight();

  // 永久净空第一页动态区域（BOOKING区+明细区+Total+Guest），防止叠字残留
  page1.drawRectangle({
    x: 10,
    y: pageHeight - 104 - 704,
    width: 580,
    height: 704,
    color: rgb(1, 1, 1)
  });

  fs.writeFileSync(CLEAN_TEMPLATE_PATH, await pdfDoc.save());
  return CLEAN_TEMPLATE_PATH;
}

function buildSections({ student, trips, coursePrice, fuelPricePerDay, tripPriceByDestination = {}, roomNightPrice = 0 }) {
  const sections = [];
  const tripDays = new Set();
  const sortedTrips = [...trips]
    .filter(t => t.trip && t.trip.trip_date)
    .sort((a, b) => new Date(a.trip.trip_date) - new Date(b.trip.trip_date));

  // Transfer（有内容才输出）
  if (student.transfer_pickup_date || student.transfer_dropoff_date || student.transfer_note) {
    sections.push({
      type: 'transfer',
      title: 'Land Transfer (Tawau Airport)',
      rows: [
        {
          layout: 'simple',
          description: `Pickup: ${formatHumanDate(student.transfer_pickup_date)}  Drop-Off: ${formatHumanDate(student.transfer_dropoff_date || student.check_out_date)}`,
          qty: 1,
          uom: 'person',
          unitPrice: Number(student.transfer_price || 0)
        }
      ]
    });
  }

  const nights = nightsBetween(student.check_in_date, student.check_out_date);
  if (nights > 0 && roomNightPrice > 0) {
    sections.push({
      type: 'accommodation',
      title: 'Accommodation',
      rows: [
        {
          layout: 'simple',
          description: `UC Homestay | Check in: ${formatHumanDate(student.check_in_date)} | Check out: ${formatHumanDate(student.check_out_date)}`,
          qty: nights,
          uom: 'x Night',
          unitPrice: roomNightPrice
        }
      ]
    });
  }

  if (coursePrice > 0) {
    const learning = String(student.learning_content || '').toUpperCase();
    const baseDate = student.check_in_date || sortedTrips[0]?.trip?.trip_date || new Date();
    let courseTitle = student.course_name || student.learning_content || 'Dive Course';
    let scheduleRows = [];
    if (learning.includes('OW+AOW')) {
      courseTitle = 'PADI Open water + Advance open water diver  开放水域+进阶开放水域潜水员';
      scheduleRows = [
        `${addDays(baseDate, 0)}    Pool & Theory    泳池和理论`,
        `${addDays(baseDate, 1)}    OW    open water    开放水域潜水员`,
        `${addDays(baseDate, 2)}    OW    open water    开放水域潜水员`,
        `${addDays(baseDate, 3)}    AOW   open water    进阶开放水域潜水员`
      ];
    } else if (learning === 'OW') {
      courseTitle = 'PADI Open water  开放水域';
      scheduleRows = [
        `${addDays(baseDate, 0)}    Pool & Theory    泳池和理论`,
        `${addDays(baseDate, 1)}    OW    open water    开放水域潜水员`,
        `${addDays(baseDate, 2)}    OW    open water    开放水域潜水员`
      ];
    } else if (learning === 'AOW') {
      courseTitle = 'PADI Advance open water  进阶开放水域';
      scheduleRows = [
        `${addDays(baseDate, 0)}    AOW   open water    进阶开放水域潜水员`,
        `${addDays(baseDate, 1)}    AOW   open water    进阶开放水域潜水员`
      ];
    }

    sections.push({
      type: 'course',
      title: 'UC Course',
      rows: [
        {
          layout: 'course_main',
          description: courseTitle,
          qty: 1,
          uom: 'person',
          unitPrice: coursePrice,
          scheduleRows
        }
      ]
    });
  }

  const activityRows = [];
  sortedTrips.forEach(tp => {
    const d = tp.trip.trip_date;
    tripDays.add(d);
    activityRows.push({
      description: `${formatHumanDate(d)}   Fun Dive   ${tp.trip.destination || '-'}`,
      qty: 1,
      uom: 'person',
      unitPrice: Number(tripPriceByDestination[tp.trip.destination] || 0)
    });
  });

  if (activityRows.length > 0) {
    const normalizedRows = activityRows.map(row => ({ ...row, layout: 'simple' }));
    sections.push({
      type: 'activities',
      title: 'Activities',
      rows: normalizedRows
    });
  }

  if (tripDays.size > 0 && fuelPricePerDay > 0) {
    sections.push({
      type: 'fuel',
      title: 'Fuel Surcharge',
      rows: [
        {
          layout: 'simple',
          description: 'All trip types',
          qty: tripDays.size,
          uom: 'day',
          unitPrice: fuelPricePerDay
        }
      ]
    });
  }

  let total = 0;
  sections.forEach(section => {
    section.rows = section.rows.map(row => {
      const rowTotal = Number(row.qty || 0) * Number(row.unitPrice || 0);
      total += rowTotal;
      return { ...row, total: rowTotal };
    });
  });

  return { sections, total };
}

function drawPageOneDynamic(page, font, boldFont, context) {
  const { student, bookingRef, visitDate, sections, total, forceAscii } = context;
  const color = rgb(0.12, 0.12, 0.12);
  const put = (text, x, top, opts = {}) => drawTopText(page, text, x, top, { ...opts, forceAscii });

  // 整块清空第一页中段（从 BOOKING 标题上方开始），避免任何旧样例残留
  clearTopRect(page, 10, 104, 580, 704);

  // BOOKING 标题与分隔线（按样例小标题样式）
  put('BOOKING', 275, 134, { size: 11.2, font: boldFont, color });
  drawTopLine(page, 35, 560, 126);
  drawTopLine(page, 250, 336, 147);

  // Booking 信息区（按样例无大边框，仅左框+中括号）
  drawTopRectBorder(page, 58, 168, 32, 64); // 左侧小框
  drawTopLine(page, 289, 349, 176); // 中部上横线
  drawTopLine(page, 289, 349, 232); // 中部下横线
  drawTopLine(page, 349, 349, 176); // 占位，保持调用一致
  {
    const pageHeight = page.getHeight();
    const y1 = pageHeight - 176;
    const y2 = pageHeight - 232;
    page.drawLine({
      start: { x: 349, y: y1 },
      end: { x: 349, y: y2 },
      thickness: 1,
      color: rgb(0.15, 0.15, 0.15)
    });
  }

  put('Attention', 62, 174, { size: 8.3, font, color });
  put(':', 121, 174, { size: 8.3, font, color });
  put('Passport', 62, 191, { size: 8.3, font, color });
  put(':', 121, 191, { size: 8.3, font, color });
  put('Wechat ID', 62, 208, { size: 8.3, font, color });
  put(':', 121, 208, { size: 8.3, font, color });
  put('Email', 62, 225, { size: 8.3, font, color });
  put(':', 121, 225, { size: 8.3, font, color });

  put('Booking Ref', 383, 174, { size: 8.3, font, color });
  put(':', 449, 174, { size: 8.3, font, color });
  put('Date', 383, 191, { size: 8.3, font, color });
  put(':', 449, 191, { size: 8.3, font, color });
  put('Admin', 383, 208, { size: 8.3, font, color });
  put(':', 449, 208, { size: 8.3, font, color });
  put('PIC', 383, 225, { size: 8.3, font, color });
  put(':', 449, 225, { size: 8.3, font, color });
  put('Date of Visit', 383, 242, { size: 8.3, font, color });
  put(':', 449, 242, { size: 8.3, font, color });
  put('Pax', 383, 259, { size: 8.3, font, color });
  put(':', 449, 259, { size: 8.3, font, color });

  put(student.name_en || student.name_cn || '-', 134, 174, { size: 8.0, font, color, maxWidth: 230 });
  put(student.passport_number || '-', 134, 191, { size: 8.0, font, color, maxWidth: 230 });
  put(student.wechat || '-', 134, 208, { size: 8.0, font, color, maxWidth: 230 });
  put(student.email || '-', 134, 225, { size: 8.0, font, color, maxWidth: 230 });

  put(bookingRef, 457, 174, { size: 8.0, font, color, maxWidth: 95 });
  put(formatHumanDate(new Date()), 457, 191, { size: 8.0, font, color, maxWidth: 95 });
  put('Fritz', 457, 208, { size: 8.0, font, color, maxWidth: 95 });
  put('Zoey', 457, 225, { size: 8.0, font, color, maxWidth: 95 });
  put(visitDate, 457, 242, { size: 8.0, font, color, maxWidth: 95 });
  put('1', 457, 259, { size: 8.0, font, color, maxWidth: 95 });

  // 表头区（样例为双横线）
  drawTopLine(page, 35, 560, 271);
  drawTopLine(page, 35, 560, 301);
  put('Item', 42, 281, { size: 8.3, font, color });
  put('Description', 102, 281, { size: 8.3, font, color });
  put('Qty', 365, 281, { size: 8.3, font, color });
  put('UOM', 408, 281, { size: 8.3, font, color });
  put('U/Price', 459, 277, { size: 8.1, font, color });
  put('MYR', 465, 291, { size: 7.8, font, color });
  put('Total', 510, 277, { size: 8.1, font, color });
  put('MYR', 516, 291, { size: 7.8, font, color });

  // 明细区
  let y = 315;
  let sectionNo = 1;
  sections.forEach(section => {
    put(String(sectionNo), 66, y, { size: 8.8, font: boldFont, color });
    put(section.title, 95, y, { size: 8.8, font: boldFont, color, maxWidth: 275 });
    y += 18;

    section.rows.forEach(row => {
      if (row.layout === 'course_main') {
        put(row.description, 95, y, { size: 7.8, font, color, maxWidth: 310, lineHeight: 9.2 });
        put(String(row.qty), 404, y, { size: 8.2, font, color, maxWidth: 28 });
        put(row.uom, 447, y, { size: 8.2, font, color, maxWidth: 45 });
        put(toMoney(row.unitPrice), 494, y, { size: 8.2, font, color, maxWidth: 38 });
        put(toMoney(row.total), 540, y, { size: 8.2, font, color, maxWidth: 38 });
        y += 18;
        (row.scheduleRows || []).forEach((s) => {
          put(s, 112, y, { size: 7.4, font, color, maxWidth: 315, lineHeight: 8.8 });
          y += 12;
        });
      } else {
        put(row.description, 95, y, { size: 8.0, font, color, maxWidth: 300, lineHeight: 9.5 });
        put(String(row.qty), 404, y, { size: 8.2, font, color, maxWidth: 28 });
        put(row.uom, 447, y, { size: 8.2, font, color, maxWidth: 45 });
        put(toMoney(row.unitPrice), 494, y, { size: 8.2, font, color, maxWidth: 38 });
        put(toMoney(row.total), 540, y, { size: 8.2, font, color, maxWidth: 38 });
        y += 20;
      }
    });

    y += 9;
    sectionNo += 1;
  });

  // Total 区（整块重绘）
  y += 4;
  drawTopLine(page, 35, 560, y);
  y += 8;
  put('Total', 430, y, { size: 8.8, font: boldFont, color });
  put(':', 490, y, { size: 8.8, font: boldFont, color });
  put('MYR', 510, y, { size: 8.8, font: boldFont, color });
  put(toMoney(total), 540, y, { size: 8.8, font: boldFont, color, maxWidth: 40 });
  y += 18;
  put('Deposit', 430, y, { size: 8.8, font: boldFont, color });
  put(':', 490, y, { size: 8.8, font: boldFont, color });
  put('MYR', 510, y, { size: 8.8, font: boldFont, color });
  put('0.00', 540, y, { size: 8.8, font: boldFont, color, maxWidth: 40 });
  y += 18;
  put('Balance', 430, y, { size: 8.8, font: boldFont, color });
  put(':', 490, y, { size: 8.8, font: boldFont, color });
  put('MYR', 510, y, { size: 8.8, font: boldFont, color });
  put(toMoney(total), 540, y, { size: 8.8, font: boldFont, color, maxWidth: 40 });

  // Guest Details（单人）
  const guestTop = Math.min(771, y + 28);
  put('Guest Details', 52, guestTop - 14, { size: 8.8, font: boldFont, color });
  drawTopRectBorder(page, 52, guestTop, 500, 20);
  drawTopRectBorder(page, 52, guestTop + 20, 500, 22);
  put('Name', 110, guestTop + 6, { size: 8.2, font, color });
  put('Gender', 210, guestTop + 6, { size: 8.2, font, color });
  put('Nationality', 270, guestTop + 6, { size: 8.2, font, color });
  put('Passport No', 378, guestTop + 6, { size: 8.2, font, color });

  const displayName = student.name_en || student.name_cn || '-';
  put('1', 62, guestTop + 26, { size: 8.0, font, color });
  put(displayName, 110, guestTop + 26, { size: 8.0, font, color, maxWidth: 90 });
  put((student.gender || '-').toUpperCase(), 210, guestTop + 26, { size: 8.0, font, color, maxWidth: 50 });
  put(student.nationality || '-', 270, guestTop + 26, { size: 8.0, font, color, maxWidth: 60 });
  put(student.passport_number || '-', 378, guestTop + 26, { size: 8.0, font, color, maxWidth: 110 });
}

async function generateStudentItineraryPdf({
  student,
  coursePrice = 0,
  fuelPricePerDay = 30,
  trips = [],
  tripPriceByDestination = {},
  roomNightPrice = 0
}) {
  const uploadDir = path.join(__dirname, '../../uploads/itineraries');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  if (!fs.existsSync(TEMPLATE_PATH)) throw new Error(`行程单模板不存在: ${TEMPLATE_PATH}`);

  const bookingRef = student.guest_id || `STU${student.id}`;
  const datePart = toDatePart(student.enrollment_date);
  const guestName = safeName(student.name_en || student.name_cn || `guest_${student.id}`) || `guest_${student.id}`;
  const fileName = `${bookingRef}-${guestName}-${datePart}.pdf`;
  const absPath = path.join(uploadDir, fileName);

  const { sections, total } = buildSections({
    student,
    trips,
    coursePrice,
    fuelPricePerDay,
    tripPriceByDestination,
    roomNightPrice
  });

  const effectiveTemplatePath = await ensureCleanTemplate();
  const templateBytes = fs.readFileSync(effectiveTemplatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  const pages = pdfDoc.getPages();
  const page1 = pages[0];

  let font;
  let boldFont;
  let forceAscii = false;
  if (fs.existsSync(ARIAL_UNICODE_PATH) && fs.existsSync(ARIAL_BOLD_PATH)) {
    font = await pdfDoc.embedFont(fs.readFileSync(ARIAL_UNICODE_PATH), { subset: true });
    boldFont = await pdfDoc.embedFont(fs.readFileSync(ARIAL_BOLD_PATH), { subset: true });
  } else if (fs.existsSync(ARIAL_PATH) && fs.existsSync(ARIAL_BOLD_PATH)) {
    font = await pdfDoc.embedFont(fs.readFileSync(ARIAL_PATH), { subset: true });
    boldFont = await pdfDoc.embedFont(fs.readFileSync(ARIAL_BOLD_PATH), { subset: true });
    forceAscii = true;
  } else {
    font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    forceAscii = true;
  }

  const firstTripDate = trips[0]?.trip?.trip_date || student.check_in_date || student.enrollment_date || new Date();
  drawPageOneDynamic(page1, font, boldFont, {
    student,
    bookingRef,
    visitDate: formatHumanDate(firstTripDate),
    sections,
    total,
    forceAscii
  });

  fs.writeFileSync(absPath, await pdfDoc.save());

  return {
    fileName,
    absPath,
    relativeUrl: `/uploads/itineraries/${fileName}`,
    total
  };
}

module.exports = { generateStudentItineraryPdf };
