const { Student } = require('../models');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// 生成报名二维码（固定的）
exports.generateEnrollmentQRCode = async (req, res) => {
  try {
    // 公开报名表单URL
    const enrollmentUrl = `${process.env.FRONTEND_URL || 'http://localhost:8848'}/enroll`;
    
    // 生成二维码
    const qrCodePath = path.join(__dirname, '../../uploads/qrcodes/enrollment-qrcode.png');
    await QRCode.toFile(qrCodePath, enrollmentUrl);
    
    res.json({
      success: true,
      message: '报名二维码生成成功',
      qrCodeUrl: '/uploads/qrcodes/enrollment-qrcode.png',
      enrollmentUrl: enrollmentUrl
    });
  } catch (error) {
    console.error('生成报名二维码失败:', error);
    res.status(500).json({
      success: false,
      message: '生成报名二维码失败'
    });
  }
};

// 获取报名二维码（如果已存在）
exports.getEnrollmentQRCode = async (req, res) => {
  try {
    const qrCodePath = path.join(__dirname, '../../uploads/qrcodes/enrollment-qrcode.png');
    
    // 检查文件是否存在
    if (!fs.existsSync(qrCodePath)) {
      // 如果不存在，生成新的
      const enrollmentUrl = `${process.env.FRONTEND_URL || 'http://localhost:8848'}/enroll`;
      await QRCode.toFile(qrCodePath, enrollmentUrl);
    }
    
    const enrollmentUrl = `${process.env.FRONTEND_URL || 'http://localhost:8848'}/enroll`;
    
    res.json({
      success: true,
      qrCodeUrl: '/uploads/qrcodes/enrollment-qrcode.png',
      enrollmentUrl: enrollmentUrl
    });
  } catch (error) {
    console.error('获取报名二维码失败:', error);
    res.status(500).json({
      success: false,
      message: '获取报名二维码失败'
    });
  }
};

// 学生公开报名（不需要认证）
exports.submitEnrollment = async (req, res) => {
  try {
    const {
      name_en,
      name_cn,
      gender,
      birth_date,
      nationality,
      phone,
      email,
      wechat,
      passport_number,
      passport_expiry,
      emergency_contact,
      emergency_phone,
      course_type,
      notes
    } = req.body;

    // 基本验证
    if (!name_en && !name_cn) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one name (English or Chinese)'
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // 检查是否已存在（通过手机号）
    const existingStudent = await Student.findOne({ where: { phone } });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered'
      });
    }

    // 创建新学生记录
    const student = await Student.create({
      name_en: name_en || name_cn, // 如果没有英文名，用中文名
      name_cn: name_cn || name_en,
      gender: gender || 'male',
      birth_date,
      nationality: nationality || 'China',
      phone,
      email,
      wechat,
      passport_number,
      passport_expiry,
      emergency_contact,
      emergency_phone,
      course_type: course_type || 'Open Water',
      notes,
      status: 'pending', // 待处理状态
      check_in_date: null,
      check_out_date: null
    });

    res.status(201).json({
      success: true,
      message: 'Enrollment submitted successfully! We will contact you soon.',
      data: {
        id: student.id,
        name_en: student.name_en,
        name_cn: student.name_cn,
        phone: student.phone
      }
    });
  } catch (error) {
    console.error('学生报名失败:', error);
    res.status(500).json({
      success: false,
      message: 'Enrollment failed. Please try again.',
      error: error.message
    });
  }
};

// 护照上传（公开接口，不需要认证）
exports.uploadPassport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const passportUrl = `/uploads/passports/${req.file.filename}`;

    // TODO: 这里可以集成OCR服务来识别护照信息
    // 例如：阿里云OCR、腾讯云OCR等
    // const ocrResult = await recognizePassport(req.file.path);

    // 暂时返回上传成功的URL，OCR功能后续添加
    res.json({
      success: true,
      message: 'Passport uploaded successfully',
      passportUrl: passportUrl,
      // ocrData: ocrResult // OCR识别结果
    });
  } catch (error) {
    console.error('护照上传失败:', error);
    res.status(500).json({
      success: false,
      message: 'Passport upload failed'
    });
  }
};

// 护照OCR识别（占位函数，后续实现）
async function recognizePassport(filePath) {
  // TODO: 集成OCR服务
  // 示例返回格式：
  return {
    passport_number: 'E12345678',
    name_en: 'ZHANG SAN',
    name_cn: '张三',
    nationality: 'CHN',
    birth_date: '1990-01-01',
    gender: 'M',
    expiry_date: '2030-12-31'
  };
}

module.exports = exports;
