const { Op } = require("sequelize");
const { Room, Student, Trip, TripParticipant, MiniappOperationLog, sequelize } = require("../models");

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

async function syncRoomOccupancy(roomId, transaction = null) {
  if (!roomId) return;
  const count = await Student.count({ where: { room_id: roomId }, transaction });
  await Room.update(
    {
      current_occupancy: count,
      status: count > 0 ? "occupied" : "available"
    },
    { where: { id: roomId }, transaction }
  );
}

exports.getTodayBoard = async (_req, res) => {
  try {
    const [todayTrips, pendingGuests, occupiedRooms] = await Promise.all([
      Trip.count({ where: { trip_date: todayDate(), status: { [Op.ne]: "cancelled" } } }),
      Student.count({ where: { status: "pending" } }),
      Room.count({ where: { status: "occupied" } })
    ]);
    res.json({
      success: true,
      data: { todayTrips, pendingGuests, occupiedRooms }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load today board" });
  }
};

async function logAction(req, action, payload) {
  if (!req.miniapp?.bindingId) return;
  await MiniappOperationLog.create({
    binding_id: req.miniapp.bindingId,
    operator_role: req.miniapp.roleType,
    action,
    payload
  });
}

exports.updateGuestStatus = async (req, res) => {
  try {
    const { studentId, status } = req.body;
    if (!studentId || !status) {
      return res.status(400).json({ success: false, message: "studentId and status are required" });
    }
    await Student.update({ status }, { where: { id: studentId } });
    const updated = await Student.findByPk(studentId);
    await logAction(req, "update_guest_status", { studentId, status });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update guest status" });
  }
};

exports.updateRoomCheckIn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { studentId, roomId, checkInDate, checkOutDate } = req.body;
    if (!studentId) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "studentId is required" });
    }
    const student = await Student.findByPk(studentId, { transaction: t });
    if (!student) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Guest not found" });
    }

    const previousRoomId = student.room_id;
    await student.update(
      {
        room_id: roomId || null,
        check_in_date: checkInDate || null,
        check_out_date: checkOutDate || null,
        status: roomId ? "active" : student.status
      },
      { transaction: t }
    );

    await syncRoomOccupancy(previousRoomId, t);
    await syncRoomOccupancy(roomId, t);

    await t.commit();
    const refreshed = await Student.findByPk(studentId);
    await logAction(req, "update_room_checkin", { studentId, roomId, checkInDate, checkOutDate });
    res.json({ success: true, data: refreshed });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: "Failed to update room check-in" });
  }
};

exports.updateTripSignIn = async (req, res) => {
  try {
    const { tripId, studentId, signInStatus } = req.body;
    if (!tripId || !studentId) {
      return res.status(400).json({ success: false, message: "tripId and studentId are required" });
    }
    const participant = await TripParticipant.findOne({ where: { trip_id: tripId, student_id: studentId } });
    if (!participant) {
      return res.status(404).json({ success: false, message: "Participant not found in trip" });
    }

    const statusMap = {
      signed_in: "completed",
      absent: "cancelled"
    };
    const mappedStatus = statusMap[signInStatus] || "confirmed";
    await participant.update({
      status: mappedStatus,
      notes: `miniapp_sign_in:${signInStatus || "confirmed"} @ ${new Date().toISOString()}`
    });

    await logAction(req, "trip_sign_in", { tripId, studentId, signInStatus: signInStatus || "confirmed" });
    res.json({ success: true, data: participant });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update trip sign-in" });
  }
};
