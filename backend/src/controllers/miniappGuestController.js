const { Student, Room, Trip, TripParticipant, Boat } = require("../models");

function ensureGuestBinding(req, res) {
  if (!req.miniapp?.student) {
    res.status(403).json({ success: false, message: "Guest binding required" });
    return null;
  }
  return req.miniapp.student;
}

exports.getProfile = async (req, res) => {
  try {
    const student = ensureGuestBinding(req, res);
    if (!student) return;
    const fresh = await Student.findByPk(student.id);
    res.json({ success: true, data: fresh });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get guest profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const student = ensureGuestBinding(req, res);
    if (!student) return;

    const editableFields = [
      "name_en",
      "name_cn",
      "phone",
      "wechat",
      "email",
      "nationality",
      "emergency_contact",
      "emergency_phone",
      "notes"
    ];
    const payload = {};
    editableFields.forEach(field => {
      if (typeof req.body[field] !== "undefined") payload[field] = req.body[field];
    });
    await Student.update(payload, { where: { id: student.id } });
    const updated = await Student.findByPk(student.id);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update guest profile" });
  }
};

exports.getTrips = async (req, res) => {
  try {
    const student = ensureGuestBinding(req, res);
    if (!student) return;

    const rows = await TripParticipant.findAll({
      where: { student_id: student.id },
      include: [
        {
          model: Trip,
          as: "trip",
          include: [{ model: Boat, as: "boat", attributes: ["id", "boat_number", "boat_name", "boat_type"] }]
        }
      ],
      order: [[{ model: Trip, as: "trip" }, "trip_date", "DESC"]]
    });

    const trips = rows.map(item => ({
      id: item.trip?.id,
      trip_date: item.trip?.trip_date,
      destination: item.trip?.destination,
      status: item.trip?.status,
      departure_time: item.trip?.departure_time,
      boat: item.trip?.boat,
      sign_in_status: item.status
    }));
    res.json({ success: true, data: trips });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get guest trips" });
  }
};

exports.getRoom = async (req, res) => {
  try {
    const student = ensureGuestBinding(req, res);
    if (!student) return;
    const fresh = await Student.findByPk(student.id, {
      include: [{ model: Room, as: "room", attributes: ["id", "room_number", "floor", "room_type", "status"] }]
    });
    if (!fresh.room) {
      return res.json({ success: true, data: null });
    }
    res.json({
      success: true,
      data: {
        ...fresh.room.toJSON(),
        check_in_date: fresh.check_in_date,
        check_out_date: fresh.check_out_date
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get guest room" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const student = ensureGuestBinding(req, res);
    if (!student) return;
    const tripRows = await TripParticipant.findAll({
      where: { student_id: student.id },
      include: [{ model: Trip, as: "trip", attributes: ["id", "trip_date", "destination", "departure_time"] }],
      order: [[{ model: Trip, as: "trip" }, "trip_date", "DESC"]],
      limit: 20
    });
    const notifications = tripRows.map(row => ({
      id: row.id,
      title: `Trip reminder · ${row.trip?.destination || "-"}`,
      content: `Date ${row.trip?.trip_date || "-"} / Departure ${row.trip?.departure_time || "-"}`,
      created_at: row.createdAt
    }));
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get notifications" });
  }
};
