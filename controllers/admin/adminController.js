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
            period: 'daily',
            salesReport: [],
            startDate: moment().startOf('day').format('YYYY-MM-DD'),
            endDate: moment().endOf('day').format('YYYY-MM-DD'),
            report: null,
            chartReport: JSON.stringify([])
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
                dateFormat = "%Y-%m-%d";
                break;
            case 'weekly':
                start = moment().startOf('week');
                end = moment().endOf('week');
                dateFormat = "%Y-%m-%d";
                break;
            case 'monthly':
                start = moment().startOf('year');
                end = moment().endOf('year');
                dateFormat = "%Y-%B";
                break;
            case 'yearly':
                start = moment().subtract(4, 'years').startOf('year');
                end = moment().endOf('year');
                dateFormat = "%Y";
                break;
            case 'custom':
                start = moment(startDate).startOf('day');
                end = moment(endDate).endOf('day');
                dateFormat = "%Y-%m-%d";
                break;
            default:
                return res.status(400).send('Invalid period');
        }
        const chartReport = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start.toDate(), $lte: end.toDate() }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: dateFormat, date: "$createdAt" }
                    },
                    totalAmount: { $sum: "$totalAmount" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
       

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
        const salesReport = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start.toDate(), $lte: end.toDate() }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$orderId',
                    userName: { $first: '$userDetails.name' },
                    paymentMethod: { $first: '$paymentMethod' },
                    totalAmount: { $first: '$totalAmount' },
                    couponUsed: { $first: '$couponUsed' },
                    discount: { $first: '$discount' },
                    products: {
                        $push: {
                            product: '$items.product',
                            price: '$items.price'
                        }
                    }
                }
            }
        ]);
        const result = reportData[0] || {
            totalSales: 0,
            totalAmount: 0,
            totalDiscount: 0,
            couponsUsed: 0
        };
        if (req.query.download === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');


            worksheet.columns = [
                { header: 'Order ID', key: 'orderId', width: 30 },
                { header: 'User Name', key: 'userName', width: 20 },
                { header: 'Payment Method', key: 'paymentMethod', width: 15 },
                { header: 'Total Amount', key: 'totalAmount', width: 15 },
                { header: 'Coupon Used', key: 'couponsUsed', width: 10 },
                { header: 'Discount', key: 'discount', width: 10 },
                { header: 'Product', key: 'product', width: 25 },
                { header: 'Price', key: 'price', width: 15 }
            ];


            salesReport.forEach(order => {
                order.products.forEach(product => {
                    worksheet.addRow({
                        orderId: order._id,
                        userName: order.userName,
                        paymentMethod: order.paymentMethod,
                        totalAmount: order.totalAmount,
                        couponsUsed: order.couponUsed ? 'Yes' : 'No',
                        discount: order.discount,
                        product: product.product,
                        price: product.price
                    });
                });
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
            await workbook.xlsx.write(res);
            return res.end();
        } else if (req.query.download === 'pdf') {
            const PDFDocument = require('pdfkit');

            const doc = new PDFDocument({ margin: 30, size: 'A3', layout: 'portrait' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');

            doc.pipe(res);

            doc.fontSize(18).text('Sales Report', { align: 'center' });
            doc.moveDown(1);


            doc.fontSize(12).text(`Period: ${startDate} to ${endDate}`);
            doc.moveDown(1);


            let y = doc.y + 10;


            const headers = [
                { label: 'Order ID', x: 50, width: 110 },
                { label: 'User Name', x: 170, width: 80 },
                { label: 'Payment', x: 260, width: 80 },
                { label: 'Total Amt', x: 350, width: 70 },
                { label: 'Coupon', x: 430, width: 50 },
                { label: 'Discount', x: 490, width: 60 },
                { label: 'Product', x: 560, width: 120 },
                { label: 'Price', x: 690, width: 60 }
            ];

            // Draw Header Row
            doc.font('Helvetica-Bold').fontSize(10);
            headers.forEach(header => {
                doc.text(header.label, header.x, y, { width: header.width, align: 'left' });
            });
            y += 15;

            doc.moveTo(50, y).lineTo(750, y).stroke();
            y += 5;

            doc.font('Helvetica').fontSize(9);
            salesReport.forEach((order, index) => {
                order.products.forEach((product, productIndex) => {

                    if ((index + productIndex) % 2 === 0) {
                        doc.rect(50, y - 2, 700, 12).fill('#f0f0f0').fillColor('black');
                    }


                    const shortOrderId = `${order._id.substring(0, 6)}...${order._id.slice(-6)}`;

                    doc.text(shortOrderId, 50, y, { width: 110 });
                    doc.text(order.userName, 170, y, { width: 80 });
                    doc.text(order.paymentMethod, 260, y, { width: 80 });
                    doc.text(`₹${order.totalAmount}`, 350, y, { width: 70 });
                    doc.text(order.couponUsed ? 'Yes' : 'No', 430, y, { width: 50 });
                    doc.text(`₹${order.discount}`, 490, y, { width: 60 });


                    doc.text(product.product, 560, y, { width: 120, ellipsis: true });

                    doc.text(`₹${product.price}`, 690, y, { width: 60 });

                    y += 15;
                });

                y += 5;
            });
            doc.end();
            return;
        }
        res.json({
            salesReport,
            chartReport,
            report: result,
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD')
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

