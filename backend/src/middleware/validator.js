const Joi = require('joi');

// 验证中间件工厂函数
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors
      });
    }

    req.validatedData = value;
    next();
  };
};

// 学员报名验证规则
const studentEnrollmentSchema = Joi.object({
  name_en: Joi.string().required().max(100).label('英文姓名'),
  name_cn: Joi.string().allow('', null).max(100).label('中文姓名'),
  gender: Joi.string().valid('male', 'female', 'other').required().label('性别'),
  birth_date: Joi.date().allow(null).label('出生日期'),
  nationality: Joi.string().allow('', null).max(50).label('国籍'),
  phone: Joi.string().required().max(20).label('电话'),
  email: Joi.string().email().allow('', null).label('邮箱'),
  wechat: Joi.string().allow('', null).max(50).label('微信号'),
  passport_number: Joi.string().required().max(50).label('护照号码'),
  passport_expiry: Joi.date().allow(null).label('护照过期日期'),
  course_id: Joi.number().integer().allow(null).label('课程ID'),
  learning_content: Joi.string().allow('', null).max(50).label('参与内容'),
  certification_level: Joi.string().allow('', null).max(50).label('证书等级'),
  room_id: Joi.number().integer().allow(null).label('房间ID'),
  emergency_contact: Joi.string().allow('', null).max(100).label('紧急联系人'),
  emergency_phone: Joi.string().allow('', null).max(20).label('紧急联系电话'),
  medical_conditions: Joi.string().allow('', null).label('医疗状况'),
  special_requirements: Joi.string().allow('', null).label('特殊要求')
});

// 登录验证规则
const loginSchema = Joi.object({
  username: Joi.string().required().label('用户名'),
  password: Joi.string().required().label('密码')
});

module.exports = {
  validate,
  studentEnrollmentSchema,
  loginSchema
};
