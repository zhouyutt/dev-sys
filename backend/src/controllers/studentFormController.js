const { Student } = require('../models');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

// 生成学生信息填写二维码
exports.generateQRCode = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: '学生不存在' });
    }

    // 生成二维码URL（指向学生信息填写页面）
    const formUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/student-form/${studentId}`;
    
    // 生成二维码图片
    const qrCodeBuffer = await QRCode.toBuffer(formUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // 保存二维码到 uploads 目录
    const uploadsDir = path.join(__dirname, '../../uploads/qrcodes');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const qrCodePath = path.join(uploadsDir, `student-${studentId}.png`);
    fs.writeFileSync(qrCodePath, qrCodeBuffer);

    const qrCodeUrl = `/uploads/qrcodes/student-${studentId}.png`;

    res.json({
      success: true,
      qrCodeUrl,
      formUrl
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
    res.status(500).json({ message: '生成二维码失败', error: error.message });
  }
};

// 获取学生信息（公开接口，用于学生填写表单）
exports.getStudentInfo = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const student = await Student.findByPk(studentId, {
      attributes: ['id', 'name_en', 'name_cn', 'phone', 'email', 
                   'passport_number', 'passport_expiry', 'passport_photo_url',
                   'birth_date', 'nationality', 'gender']
    });
    
    if (!student) {
      return res.status(404).json({ message: '学生不存在' });
    }

    res.json(student);
  } catch (error) {
    console.error('获取学生信息失败:', error);
    res.status(500).json({ message: '获取学生信息失败', error: error.message });
  }
};

// 更新学生护照信息（公开接口）
exports.updatePassportInfo = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { 
      passport_number, 
      passport_expiry, 
      birth_date, 
      nationality,
      passport_photo_url 
    } = req.body;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: '学生不存在' });
    }

    // 更新护照信息
    await student.update({
      passport_number,
      passport_expiry,
      birth_date,
      nationality,
      passport_photo_url
    });

    res.json({
      success: true,
      message: '护照信息更新成功',
      student
    });
  } catch (error) {
    console.error('更新护照信息失败:', error);
    res.status(500).json({ message: '更新护照信息失败', error: error.message });
  }
};

// 护照图片上传
exports.uploadPassportPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传护照图片' });
    }

    const photoUrl = `/uploads/passports/${req.file.filename}`;
    
    res.json({
      success: true,
      photoUrl,
      message: '护照图片上传成功'
    });
  } catch (error) {
    console.error('上传护照图片失败:', error);
    res.status(500).json({ message: '上传护照图片失败', error: error.message });
  }
};
