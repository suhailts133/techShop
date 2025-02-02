const env = require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../../models/userSchema");
const moment = require('moment');
const ExcelJS = require('exceljs');
// const pdfMake = require('pdfmake/build/pdfmake');
// const pdfFonts = require('pdfmake/build/vfs_fonts');
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
const Order = require("../../models/orderSchema.js")

const adminLoadLogin = async (req, res) => {
    try {
        res.render("adminLogin")
    } catch (error) {
        console.log("error while login the admin login", error.message)
    }
}

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const findAdmin = await User.findOne({ email });
        if (!findAdmin) {
            req.flash("error", "not admin");
            return res.redirect("/admin/")
        }
        if (!findAdmin.isAdmin) {
            req.flash("error", "not admin");
            return res.redirect("/admin/")
        }
        const passwordMatch = await bcrypt.compare(password, findAdmin.password);
        if (!passwordMatch) {
            req.flash("error", "not admin")
            return res.redirect("/admin/")
        }
        req.session.admin = { id: findAdmin._id, name: findAdmin.name };
        console.log("admin logging in", req.session.admin);
        res.redirect("/admin/dashboard");
    } catch (error) {
        console.log("error while logging in the admin", error.message)
    }
}

const loadDashboard = async (req, res) => {
    try {
        console.log("session from load dashboard", req.session.admin)
        res.render("dashboard", {
            admin: req.session.admin || null,
            title: "Dashboard",
            // Add default values for report-related variables
            period: 'daily',
            startDate: moment().startOf('day').format('YYYY-MM-DD'),
            endDate: moment().endOf('day').format('YYYY-MM-DD'),
            report: null,
            chartData: JSON.stringify([])
        })
    } catch (error) {
        console.log("error while loading admin dashboard", error.message);
    }
}


const getSalesReport = async (req, res) => {
    try {
        const { period, startDate, endDate } = req.query;
        let start, end;

        switch (period) {
            case 'daily':
                start = moment().startOf('day');
                end = moment().endOf('day');
                break;
            case 'weekly':
                start = moment().startOf('week'); // Current week
                end = moment().endOf('week');
                break;
            case 'monthly':
                start = moment().startOf('year'); // Entire current year
                end = moment().endOf('year');
                break;
            case 'yearly':
                start = moment().subtract(4, 'years').startOf('year'); // Last 5 years
                end = moment().endOf('year');
                break;
            case 'custom':
                start = moment(startDate).startOf('day');
                end = moment(endDate).endOf('day');
                break;
            default:
                return res.status(400).send('Invalid period');
        }

        // Aggregation for summary data
        const reportData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start.toDate(), $lte: end.toDate() }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: 1 },
                    totalAmount: { $sum: "$totalAmount" },
                    totalDiscount: { $sum: "$discount" },
                    couponsUsed: { $sum: { $cond: [{ $eq: ["$couponUsed", true] }, 1, 0] } }
                }
            }
        ]);

        // Aggregation for chart data based on period
        let groupBy = {};
        switch (period) {
            case 'daily':
                groupBy = {
                    $group: {
                        _id: { $hour: "$createdAt" }, // Group by hour
                        total: { $sum: "$totalAmount" },
                        count: { $sum: 1 } // Optional: if needed for other purposes
                    }
                };
                break;
            case 'weekly':
                groupBy = {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Group by day
                        total: { $sum: "$totalAmount" }
                    }
                };
                break;
            case 'monthly':
                groupBy = {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, // Group by month
                        total: { $sum: "$totalAmount" }
                    }
                };
                break;
            case 'yearly':
                groupBy = {
                    $group: {
                        _id: { $year: "$createdAt" }, // Group by year
                        total: { $sum: "$totalAmount" }
                    }
                };
                break;
            default:
                groupBy = {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        total: { $sum: "$totalAmount" }
                    }
                };
        }

        const chartData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start.toDate(), $lte: end.toDate() }
                }
            },
            groupBy,
            { $sort: { "_id": 1 } }
        ]);

        const result = reportData[0] || {
            totalSales: 0,
            totalAmount: 0,
            totalDiscount: 0,
            couponsUsed: 0
        };

        // Handle download requests (Excel)
        if (req.query.download) {
            if (req.query.download === 'excel') {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Sales Report');

                worksheet.columns = [
                    { header: 'Metric', key: 'metric' },
                    { header: 'Value', key: 'value' }
                ];

                worksheet.addRow({ metric: 'Total Orders', value: result.totalSales });
                worksheet.addRow({ metric: 'Total Amount', value: result.totalAmount });
                worksheet.addRow({ metric: 'Total Discount', value: result.totalDiscount });
                worksheet.addRow({ metric: 'Coupons Used', value: result.couponsUsed });

                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
                await workbook.xlsx.write(res);
                return res.end();
            }
        } else {
            res.render('dashboard', {
                admin: req.session.admin || null,
                title: "Sales Report",
                period: period || 'daily',
                startDate: start.format('YYYY-MM-DD'),
                endDate: end.format('YYYY-MM-DD'),
                report: result || null,
                chartData: JSON.stringify(chartData || [])
            });
        }
    } catch (error) {
        console.error('Error generating sales report:', error);
        res.status(500).send('Server Error');
    }
};


const logout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session", err.message);
                return res.status(500).send("Error logging out");
            }
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");

            res.redirect("/admin/");
        });
    } catch (error) {
        console.log("error while logging out the user", error.message)
        res.redirect("/pageNotFound")
    }
};



module.exports = {
    adminLoadLogin,
    adminLogin,
    loadDashboard,
    logout,
    getSalesReport
}