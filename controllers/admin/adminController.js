const env = require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../../models/userSchema");
const moment = require('moment');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
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
                start = moment().startOf('week');
                end = moment().endOf('week');
                break;
            case 'monthly':
                start = moment().startOf('year');
                end = moment().endOf('year');
                break;
            case 'yearly':
                start = moment().subtract(4, 'years').startOf('year');
                end = moment().endOf('year');
                break;
            case 'custom':
                start = moment(startDate).startOf('day');
                end = moment(endDate).endOf('day');
                break;
            default:
                return res.status(400).send('Invalid period');
        }

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
        console.log("reported data",reportData);
        
        const result = reportData[0] || {
            totalSales: 0,
            totalAmount: 0,
            totalDiscount: 0,
            couponsUsed: 0
        };
        console.log("result",result);
        
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
        }else if (req.query.download === 'pdf') {
            const doc = new PDFDocument();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
            
            doc.pipe(res);
            
            // Add PDF content
            doc.fontSize(18).text('Sales Report', { align: 'center' });
            doc.moveDown();
            
            doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`);
            doc.moveDown();
            
            // Create table-like structure
            const metrics = [
                { metric: 'Total Orders', value: result.totalSales },
                { metric: 'Total Amount', value: `₹${result.totalAmount.toFixed(2)}` },
                { metric: 'Total Discount', value: `₹${result.totalDiscount.toFixed(2)}` },
                { metric: 'Coupons Used', value: result.couponsUsed }
            ];
            
            metrics.forEach((item, index) => {
                doc.font('Helvetica-Bold').text(item.metric, { continued: true });
                doc.font('Helvetica').text(`: ${item.value}`);
                if (index !== metrics.length - 1) doc.moveDown(0.5);
            });
            
            doc.end();
            return;
        }

        res.render('dashboard', {
            admin: req.session.admin || null,
            title: "Sales Report",
            period: period || 'daily',
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD'),
            report: result || null
        });
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