const { now } = require("mongoose");
const Order = require("../model/orderModel");
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");

const generatePDF = async (filterCondition, res, page, perPage) => {
  const allOrders = await Order.find(filterCondition);
  const totalSalesAmount = allOrders.reduce((acc, order) => acc + order.billTotal, 0);
  const totalDiscount = allOrders.reduce((acc, order) => acc + (order.couponAmount || 0), 0);
  const salesCount = allOrders.length;
  const totalOrders = allOrders.length;

  const orders = await Order.find(filterCondition)
      .populate('user')
      .populate('items.productId')
      .populate('couponId')
      .skip((page - 1) * perPage)
      .limit(perPage);

  console.log('filter check', orders);
  const doc = new PDFDocument();
  const filename = 'sales_report.pdf';
  const filePath = path.join(__dirname, '..', 'public', 'downloads', filename);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  doc.fontSize(20).text('Sales Report', { align: 'center' });
  doc.moveDown();

  // Adding the table to the PDF document
  const table = {
      headers: [
          'Date',
          'Order No.',
          'Customer',
          'Products',
          'Quantity Sold',
          'Price',
          'Discount Amount',
          'Total Price',
      ],
      rows: orders.map((order) => [
          new Date(order.orderDate).toLocaleString('en-IN'),
          order.orderId,
          order.user.name,
          order.items.map((item) => item.productId.title).join(', '),
          order.items.map((item) => item.quantity).join(', '),
          order.items.map((item) => item.productPrice.toFixed(2)).join(', '),
          order.couponAmount ? order.couponAmount.toFixed(2) : '0.00',
          order.billTotal.toFixed(2),
      ]),
  };

  const tableOptions = {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
      prepareRow: (row, i) => doc.font('Helvetica').fontSize(10),
  };

  // Adding table to PDF
  doc.table(table, tableOptions);

  doc.moveDown();

  // Adding the summary after the table
  doc.fontSize(12).text(`Total Sales Count: ${salesCount}`, { align: 'left' });
  doc.text(`Total Sales Amount: ${totalSalesAmount.toFixed(2)}`, { align: 'right' });
  doc.text(`Total Discount Amount: ${totalDiscount.toFixed(2)}`, { align: 'right' });

  doc.end();
};

const loadSalesReport = async (req, res) => {
  try {
    const perPage = 6;
    const page = parseInt(req.query.page) || 1;

    const deliveredOrders = await Order.find({ orderStatus: "Delivered" })
      .populate("user")
      .populate("items.productId")
      .populate("couponId")
      .skip((page - 1) * perPage)
      .limit(perPage);

    const totalOrders = await Order.countDocuments({
      orderStatus: "Delivered",
    });
    const totalPages = Math.ceil(totalOrders / perPage);

    // Calculate total sales count, total discount amount, and total sales amount
    const allDeliveredOrders = await Order.find({ orderStatus: "Delivered" });
    const totalSalesCount = allDeliveredOrders.length;
    const totalDiscountAmount = allDeliveredOrders.reduce((acc, order) => acc + (order.couponAmount || 0), 0);
    const totalSalesAmount = allDeliveredOrders.reduce((acc, order) => acc + order.billTotal, 0);

    res.render("salesReport", {
      order: deliveredOrders,
      currentPage: page,
      totalPages: totalPages,
      totalSalesCount: totalSalesCount,
      totalDiscountAmount: totalDiscountAmount.toFixed(2),
      totalSalesAmount: totalSalesAmount.toFixed(2),
    });
  } catch (error) {
    console.log(error);
  }
};

const filterSalesReport = async (req, res) => {
  try {
    console.log("reached here");
    const { filterType, startDate, endDate, page = 1 } = req.query;
    const perPage = 6;

    // Define 'now' as the current date
    const now = new Date();

    let filterCondition = { orderStatus: "Delivered" };

    if (filterType === "daily") {
      const today = new Date(now.setHours(0, 0, 0, 0));
      filterCondition.orderDate = { $gte: today };
    } else if (filterType === "weekly") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      filterCondition.orderDate = { $gte: startOfWeek };
    } else if (filterType === "monthly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filterCondition.orderDate = { $gte: startOfMonth };
    } else if (filterType === "yearly") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filterCondition.orderDate = { $gte: startOfYear };
    } else if (filterType === "filter" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      console.log(start, "startdate");
      console.log(end, "enddate");
      if (start.getTime() === end.getTime()) {
        // If startDate and endDate are the same, get orders for that specific day
        filterCondition.orderDate = {
          $gte: start,
          $lt: new Date(start.getTime() + 24 * 60 * 60 * 1000), // Add one day to the start date
        };
      } else {
        filterCondition.orderDate = {
          $gte: start,
          $lte: end,
        };
      }
    


    
    }


    const allOrders = await Order.find(filterCondition);
    const totalSalesAmount = allOrders.reduce((acc, order) => acc + order.billTotal, 0);
    const totalDiscount = allOrders.reduce((acc, order) => acc + (order.couponAmount || 0), 0);
    const salesCount = allOrders.length;

    // Apply pagination
    const totalOrders = allOrders.length;
    const totalPages = Math.ceil(totalOrders / perPage);

  

    const deliveredOrders = await Order.find(filterCondition)
      .populate("user")
      .populate("items.productId")
      .populate("couponId")
      .skip((page - 1) * perPage)
      .limit(perPage);

   
    res.json({
      orders: deliveredOrders,
      totalDiscount,
      totalSalesAmount,
      salesCount,
      currentPage: parseInt(page,10),
      totalPages,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

const downloadPDF = async (req, res) => {
  try {
    const { filterType, startDate, endDate,page } = req.query;
    const perPage=6;
    const now = new Date();
    let filterCondition = { orderStatus: "Delivered" };
    console.log("pdf check",filterType);
    console.log("start:",startDate);
    console.log("end:",endDate);
    // Define filter conditions based on the filterType
    if (filterType === "daily") {
      const today = new Date(now.setHours(0, 0, 0, 0));
      filterCondition.orderDate = { $gte: today };
    } else if (filterType === "weekly") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      filterCondition.orderDate = { $gte: startOfWeek };
    } else if (filterType === "monthly") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filterCondition.orderDate = { $gte: startOfMonth };
    } else if (filterType === "yearly") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filterCondition.orderDate = { $gte: startOfYear };
    } else if (filterType === "filter" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start.getTime() === end.getTime()) {
        filterCondition.orderDate = {
          $gte: start,
          $lt: new Date(start.getTime() + 24 * 60 * 60 * 1000),
        };
      } else {
        filterCondition.orderDate = {
          $gte: start,
          $lte: end,
        };
      }
    }

    // Generate the PDF
    await generatePDF(filterCondition, res,page,perPage);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  loadSalesReport,
  filterSalesReport,
  downloadPDF,
};
