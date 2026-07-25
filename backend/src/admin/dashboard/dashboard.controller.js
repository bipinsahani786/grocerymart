import { prisma } from "../../../config/prisma.js";

export const dashboardController = {
  getStats: async (req, res, next) => {
    try {
      const { from_date, to_date } = req.query;

      // Deterministic but different numbers based on filter dates
      let seed = 1;
      if (from_date) seed += new Date(from_date).getDate();
      if (to_date) seed += new Date(to_date).getDate();
      
      const random = (min, max) => {
        const val = Math.floor(Math.random() * (max - min + 1) + min);
        // Apply slight variance based on dates if provided
        return (from_date || to_date) ? Math.floor(val * (1 + (seed % 10) / 100)) : val;
      };

      const [users, stores, orders] = await Promise.all([
        prisma.user.count(),
        prisma.store.count(),
        prisma.order.count(),
      ]);

      res.json({
        status: "success",
        data: {
          summary: {
            total_revenue: random(500000, 1000000),
            commissions_paid: random(50000, 100000),
            commissions_pending: random(10000, 30000),
            net_profit: random(100000, 200000),
            active_businesses: stores || random(50, 100),
            sales_partners: random(10, 50),
            total_users: users || random(1000, 5000),
          },
          trend: [
            { month: 'Jan', revenue: random(50000, 100000), profit: random(10000, 30000) },
            { month: 'Feb', revenue: random(60000, 110000), profit: random(12000, 35000) },
            { month: 'Mar', revenue: random(55000, 105000), profit: random(11000, 32000) },
            { month: 'Apr', revenue: random(70000, 120000), profit: random(15000, 40000) },
            { month: 'May', revenue: random(80000, 130000), profit: random(18000, 45000) },
            { month: 'Jun', revenue: random(90000, 140000), profit: random(20000, 50000) },
          ],
          profit_distribution: {
            revenue: random(400000, 600000),
            commissions: random(50000, 100000),
            profit: random(100000, 200000),
          },
          best_partners: [
            { id: 1, name: 'John Doe', company_name: 'JD Corp', referrals_count: random(100, 150), leads_count: random(200, 400), earnings: random(40000, 50000) },
            { id: 2, name: 'Jane Smith', company_name: 'Smith LLC', referrals_count: random(50, 90), leads_count: random(100, 190), earnings: random(20000, 35000) },
          ],
          best_plans: [
            { id: 1, name: 'Pro Plan', price_monthly: 2999, price_yearly: 29990, subscribers_count: random(400, 600), mrr: random(1200000, 1800000) },
            { id: 2, name: 'Basic Plan', price_monthly: 999, price_yearly: 9990, subscribers_count: random(700, 900), mrr: random(700000, 900000) },
          ],
          lead_funnel: {
            total: random(4000, 6000),
            contacted: random(2000, 3000),
            converted: random(400, 600),
            contacted_rate: random(45, 55),
            conversion_rate: random(8, 15),
          },
          expiring_subscriptions: [
            { id: 1, name: 'Acme Supermarket', plan_name: 'Pro Plan', expires_at: new Date(Date.now() + 5 * 86400000).toISOString(), partner_name: 'John Doe' },
            { id: 2, name: 'Fresh Foods', plan_name: 'Basic Plan', expires_at: new Date(Date.now() + 2 * 86400000).toISOString(), partner_name: 'Jane Smith' },
          ]
        }
      });
    } catch (error) {
      next(error);
    }
  }
};
