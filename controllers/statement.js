import UsersModal from "../models/users.js";
import OrdersModal from "../models/orders.js";
import expenses from "../models/expenses.js";

export const GetProfitLossStatement = async (req, res) => {
    let filters = {};
    const query = req.query;
    const user = await UsersModal.findOne({_id: req.userId});

    if (!["admin", "superAdmin"].includes(user.role)) return res.status(401).json({message: "You are not allowed to access this resource"})



    if (query.created_at_gteq !== '' && query.created_at_lteq !== '') {
        filters.createdAt = {
            $gte: `${query.created_at_gteq}T00:00:00.000Z`,
            $lt: `${query.created_at_lteq}T23:59:59.999Z`,
        };
    } else {
        const date = new Date();
        const month = date.getMonth();
        const year = date.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        filters.createdAt = {
            $gte: firstDayOfMonth,
            $lt: lastDayOfMonth,
        };
    }

    if (user?.store &&
        user.role === 'admin') {
        filters.store = user.store;
    }

    try {
        let totalSales = await OrdersModal.aggregate([
            {$match: filters},
            {
                $group: {_id: null, total: {$sum: '$total'}},
            },
        ]);

        let totalExpenses = await expenses.aggregate([
            {$match: filters},
            {
                $group: {_id: null, total: {$sum: '$amount'}},
            },
        ]);
        let totalRetailPrice = await OrdersModal.aggregate([
            {$match: filters},
            {
                $group: {_id: null, total: {$sum: '$totalRetailPrice'}},
            },
        ]);

        console.log(totalSales , totalExpenses , totalRetailPrice)

        const grossProfit = totalSales[0]?.total - totalRetailPrice[0]?.total || 0;
        const netProfit = grossProfit - totalExpenses[0]?.total || 0;

        res.json({
            sales: totalSales[0]?.total || 0,
            costOfGoodsSold: totalRetailPrice[0]?.total || 0,
            expense: totalExpenses[0]?.total || 0,
            grossProfit,
            netProfit,
        })

    } catch (e) {
        console.log(e)
        res.send(400).json({message: e.message})
    }
}
