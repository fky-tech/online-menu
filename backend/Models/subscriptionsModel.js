import mySqlConnection from "../Config/db.js";

export const createSubscriptionModel = async (restaurant_id, package_type, start_date, end_date, status, amount_paid) => {
  const sql = `
    INSERT INTO subscriptions (restaurant_id, package_type, start_date, end_date, status, amount_paid)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await mySqlConnection.query(sql, [restaurant_id, package_type, start_date, end_date, status, amount_paid]);
  return { id: result.insertId, restaurant_id, package_type, start_date, end_date, status, amount_paid };
};

export const updateSubscriptionModel = async (id, fields) => {
  const columns = [];
  const values = [];
  for (const [k, v] of Object.entries(fields)) {
    columns.push(`${k} = ?`);
    values.push(v);
  }
  if (!columns.length) return null;
  const sql = `UPDATE subscriptions SET ${columns.join(', ')} WHERE id = ?`;
  values.push(id);
  await mySqlConnection.query(sql, values);
  return { id, ...fields };
};

export const listSubscriptionsModel = async (restaurant_id) => {
  const sql = `SELECT * FROM subscriptions WHERE restaurant_id = ? ORDER BY id DESC`;
  const [rows] = await mySqlConnection.query(sql, [restaurant_id]);
  return rows;
};

export const getActiveSubscriptionModel = async (restaurant_id) => {
  const sql = `
    SELECT * FROM subscriptions
    WHERE restaurant_id = ?
      AND status = 'active'
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    ORDER BY id DESC LIMIT 1
  `;
  const [rows] = await mySqlConnection.query(sql, [restaurant_id]);
  return rows[0];
};

// Latest subscription per restaurant for dashboard listing
export const latestSubscriptionsForAllModel = async () => {
  const sql = `
    SELECT s.*,
           CASE
             WHEN s.end_date IS NULL THEN NULL
             ELSE DATEDIFF(s.end_date, CURRENT_DATE)
           END AS days_left
    FROM subscriptions s
    INNER JOIN (
      SELECT restaurant_id, MAX(id) AS max_id
      FROM subscriptions
      GROUP BY restaurant_id
    ) t ON s.restaurant_id = t.restaurant_id AND s.id = t.max_id
  `;
  const [rows] = await mySqlConnection.query(sql);
  return rows;
};




// ===== Metrics helpers =====
export const countActiveTenantsModel = async () => {
  const sql = `
    SELECT COUNT(DISTINCT restaurant_id) AS cnt
    FROM subscriptions
    WHERE status = 'active' AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  `;
  const [rows] = await mySqlConnection.query(sql);
  return rows[0]?.cnt || 0;
};

export const countExpiredTenantsModel = async () => {
  const sql = `
    SELECT COUNT(*) AS cnt FROM restaurants r
    WHERE NOT EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.restaurant_id = r.id
        AND s.status = 'active'
        AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
    )
  `;
  const [rows] = await mySqlConnection.query(sql);
  return rows[0]?.cnt || 0;
};

export const distributionByPlanModel = async () => {
  const sql = `
    SELECT package_type, COUNT(DISTINCT restaurant_id) AS cnt
    FROM subscriptions
    WHERE status = 'active' AND (end_date IS NULL OR end_date >= CURRENT_DATE)
    GROUP BY package_type
    ORDER BY cnt DESC
  `;
  const [rows] = await mySqlConnection.query(sql);
  return rows;
};

export const revenueTrendsModel = async () => {
  const sql = `
    SELECT DATE_FORMAT(start_date, '%Y-%m') AS month, SUM(amount_paid) AS revenue
    FROM subscriptions
    GROUP BY DATE_FORMAT(start_date, '%Y-%m')
    ORDER BY month ASC
  `;
  const [rows] = await mySqlConnection.query(sql);
  return rows;
};
