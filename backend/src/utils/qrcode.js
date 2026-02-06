const QRCode = require('qrcode');

/**
 * 生成二维码
 * @param {string} data - 要编码的数据
 * @param {object} options - 可选配置
 * @returns {Promise<string>} - Base64编码的二维码图片
 */
const generateQRCode = async (data, options = {}) => {
  try {
    const qrOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: options.width || 300,
      ...options
    };

    const qrCodeDataURL = await QRCode.toDataURL(data, qrOptions);
    return qrCodeDataURL;
  } catch (error) {
    console.error('生成二维码失败:', error);
    throw new Error('生成二维码失败');
  }
};

/**
 * 生成报名二维码URL
 * @param {string} baseUrl - 基础URL
 * @returns {string} - 报名页面URL
 */
const generateEnrollmentURL = (baseUrl) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
  return `${frontendUrl}/enroll`;
};

module.exports = {
  generateQRCode,
  generateEnrollmentURL
};
