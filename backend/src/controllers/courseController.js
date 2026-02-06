const { Course, Student } = require('../models');

// 获取所有课程
exports.getAllCourses = async (req, res) => {
  try {
    const { status } = req.query;
    
    const where = {};
    if (status) where.status = status;

    const courses = await Course.findAll({
      where,
      order: [['level', 'ASC'], ['course_code', 'ASC']]
    });

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('获取课程列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取课程列表失败'
    });
  }
};

// 获取单个课程
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { 
          model: Student, 
          as: 'students',
          attributes: ['id', 'name_en', 'name_cn', 'status']
        }
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('获取课程详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取课程详情失败'
    });
  }
};

// 创建课程
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);

    res.status(201).json({
      success: true,
      message: '创建课程成功',
      data: course
    });
  } catch (error) {
    console.error('创建课程失败:', error);
    res.status(500).json({
      success: false,
      message: '创建课程失败',
      error: error.message
    });
  }
};

// 更新课程
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    await course.update(req.body);

    res.json({
      success: true,
      message: '更新成功',
      data: course
    });
  } catch (error) {
    console.error('更新课程失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
};

// 删除课程
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    await course.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除课程失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
};
