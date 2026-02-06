const { generateQRCode, generateEnrollmentURL } = require('../utils/qrcode');

// 生成报名二维码
exports.generateEnrollmentQRCode = async (req, res) => {
  try {
    const enrollmentURL = generateEnrollmentURL();
    const qrCodeImage = await generateQRCode(enrollmentURL);

    res.json({
      success: true,
      data: {
        url: enrollmentURL,
        qrCode: qrCodeImage
      }
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
    res.status(500).json({
      success: false,
      message: '生成二维码失败'
    });
  }
};

// 生成自定义二维码
exports.generateCustomQRCode = async (req, res) => {
  try {
    const { data, width } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: '请提供二维码数据'
      });
    }

    const qrCodeImage = await generateQRCode(data, { width });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeImage
      }
    });
  } catch (error) {
    console.error('生成二维码失败:', error);
    res.status(500).json({
      success: false,
      message: '生成二维码失败'
    });
  }
};
