const Tesseract = require('tesseract.js');
const sharp = require('sharp');

/**
 * 预处理护照图片
 * @param {string} imagePath - 图片路径
 * @returns {Promise<Buffer>} - 处理后的图片buffer
 */
const preprocessImage = async (imagePath) => {
  try {
    return await sharp(imagePath)
      .resize(2000, null, { // 调整大小以提高识别率
        fit: 'inside',
        withoutEnlargement: true
      })
      .greyscale() // 转为灰度
      .normalize() // 归一化
      .sharpen() // 锐化
      .toBuffer();
  } catch (error) {
    console.error('图片预处理失败:', error);
    throw error;
  }
};

/**
 * 从护照图片中提取信息
 * @param {string} imagePath - 图片路径
 * @returns {Promise<object>} - 提取的护照信息
 */
const extractPassportInfo = async (imagePath) => {
  try {
    // 预处理图片
    const processedImage = await preprocessImage(imagePath);

    // 使用Tesseract进行OCR识别
    const { data: { text } } = await Tesseract.recognize(
      processedImage,
      'eng',
      {
        logger: info => console.log('OCR进度:', info)
      }
    );

    console.log('OCR识别结果:', text);

    // 解析护照信息
    const passportInfo = parsePassportText(text);
    
    return passportInfo;
  } catch (error) {
    console.error('护照信息提取失败:', error);
    throw new Error('护照信息提取失败');
  }
};

/**
 * 解析OCR识别的文本
 * @param {string} text - OCR识别的文本
 * @returns {object} - 解析后的护照信息
 */
const parsePassportText = (text) => {
  const info = {
    passport_number: null,
    name_en: null,
    nationality: null,
    birth_date: null,
    passport_expiry: null,
    gender: null
  };

  // 这里使用简单的正则表达式匹配
  // 实际生产环境中可能需要更复杂的解析逻辑或使用专门的护照识别API

  // 匹配护照号码 (通常是大写字母+数字的组合)
  const passportNumMatch = text.match(/[A-Z]{1,2}\d{6,9}/);
  if (passportNumMatch) {
    info.passport_number = passportNumMatch[0];
  }

  // 匹配日期格式 (DD MMM YYYY 或 DD/MM/YYYY)
  const datePattern = /\d{2}[\s/-](JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[\s/-]\d{4}|\d{2}\/\d{2}\/\d{4}/gi;
  const dates = text.match(datePattern);
  if (dates && dates.length >= 2) {
    info.birth_date = dates[0];
    info.passport_expiry = dates[1];
  }

  // 匹配性别
  if (text.match(/\bM\b|\bMALE\b/i)) {
    info.gender = 'male';
  } else if (text.match(/\bF\b|\bFEMALE\b/i)) {
    info.gender = 'female';
  }

  return info;
};

module.exports = {
  extractPassportInfo,
  preprocessImage,
  parsePassportText
};
