const { Op, fn, col } = require("sequelize");
const { Room, Student, Trip } = require("../models");

const CACHE_TTL_MS = Number(process.env.MINIAPP_OWNER_CACHE_MS || 60000);
let ownerDashboardCache = { data: null, expiredAt: 0 };

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

exports.getDashboard = async (_req, res) => {
  try {
    if (ownerDashboardCache.data && ownerDashboardCache.expiredAt > Date.now()) {
      return res.json({ success: true, data: ownerDashboardCache.data, cached: true });
    }

    const [todayTrips, totalGuests, occupiedRooms, totalRooms, destinationRows] = await Promise.all([
      Trip.count({ where: { trip_date: todayDate(), status: { [Op.ne]: "cancelled" } } }),
      Student.count(),
      Room.count({ where: { status: "occupied" } }),
      Room.count(),
      Trip.findAll({
        attributes: ["destination", [fn("COUNT", col("destination")), "count"]],
        group: ["destination"],
        order: [[fn("COUNT", col("destination")), "DESC"]],
        limit: 1
      })
    ]);

    const occupancyRate = totalRooms ? Number(((occupiedRooms / totalRooms) * 100).toFixed(2)) : 0;
    const payload = {
      todayTrips,
      totalGuests,
      occupiedRooms,
      totalRooms,
      occupancyRate,
      topDestination: destinationRows[0]?.destination || ""
    };
    ownerDashboardCache = { data: payload, expiredAt: Date.now() + CACHE_TTL_MS };

    res.json({ success: true, data: payload, cached: false });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load owner dashboard" });
  }
};
