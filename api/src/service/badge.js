const CustomError = require("../model/CustomError");
const { sql } = require("../db");
const { v4: uuidv4 } = require("uuid");
const purchaseService = require("./purchase");

exports.createBadge = async (badges) => {
  const formattedBadges = badges.map((badge) => {
    const qrUuid = uuidv4();
    const badgeStatus = 0;
    return { ...badge, qrUuid, badgeStatus };
  });
  return await sql`insert into badge ${sql(formattedBadges)} returning *`;
};

exports.updateBadgeStatus = async (userId, purchaseId) => {
  const [purchase] = await purchaseService.getPurchaseById(purchaseId);
  if (purchase.paymentStatus.toLowerCase() === "pending")
    throw new CustomError("Payment status is pending!", 401);

  const [updatedBadge] = await sql`
        update badge
        set badge_status = 1
        where user_id = ${userId}
        returning *`;

  return updatedBadge;
};

exports.getBadgeById = async (badgeId) => {
  const [badge] = await sql`select *
                              from badge
                              where id = ${badgeId}`;
  return badge;
};

exports.validateQrCode = async (id, qrUuid, eventId) => {
  const [badge] = await sql`select *
                              from badge
                              where id = ${id}`;
  if (
    !badge ||
    badge.qrUuid !== qrUuid ||
    badge.badgeStatus === 1 ||
    badge.eventId !== eventId
  )
    throw new CustomError("Invalid QR Code", 401);

  return badge;
};

exports.getBadgeWDesignWVisibility = async (badgeId) => {
  const [result] = await sql`
        select b.*,
               bd.*,
               bv.*,
               u.*,
               b.id  as b_id,
               bd.id as bd_id,
               bv.id as bv_id,
               u.id  as u_id
        from badge b
                 join users u on u.id = b.user_id
                 join badge_design bd on b.badge_design_id = bd.id
                 join badge_visibility bv on b.badge_design_id = bv.badge_design_id
        where b.id = ${badgeId}`;
  console.log(90, result);
  return result;
};
