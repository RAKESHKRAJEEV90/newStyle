// const OrderModel = require('../models/products/orderModels')

// const moment = require('moment'); // For date manipulations

// const loadChartData = async(req,res)=>{
// try {
// const timeRange = req.params.timeRange;
// console.log(timeRange)
// // Return the appropriate data based on the time range
//  let orderData;
//  let categories;
//  if (timeRange === 'weekly') {
//  const oneWeekAgo = new Date();
//  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Calculate one week ago
//  orderData = await OrderModel.find({
// // // Add your query criteria for weekly data
// // // For example, you might want to fetch orders created in the last week
//  orderDate: { $gte: oneWeekAgo, $lte: new Date() }, // Assuming 'createdAt' is the date field in your schema
// });

// } else if (timeRange === 'monthly') {
//    const now = new Date();
//  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the current month
// const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of the current month
// orderData = await OrderModel.find({
// // // Add your query criteria for monthly data
// // // For example, you might want to fetch orders created within the current month
// orderDate: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }, // Assuming 'createdAt' is the date field in your schema
//  });
//  } else if (timeRange === 'yearly') {
//  const now = new Date();
//  const startOfYear = new Date(now.getFullYear(), 0, 1); // First day of the current year
// const endOfYear = new Date(now.getFullYear(), 11, 31); // Last day of the current year
//  orderData = await OrderModel.find({
// // // Add your query criteria for yearly data
// // // For example, you might want to fetch orders created within the current year
//  orderDate: { $gte: startOfYear, $lte: endOfYear }, // Assuming 'createdAt' is the date field in your schema
//  });

//  }
//  console.log("order",orderData)
//  if (orderData) {
// // // Transform orderData into the structure you need
//  let data = {
//  series: [
//  {
//  name: 'Sales',
//  data: orderData.map((item) => item.sales), // Adjust this based on your schema
//  },
//  {
//  name: 'Cost',
//  data: orderData.map((item) => item.cost), // Adjust this based on your schema
//  },
//  ],
//  categories: []
//  };

//  return data;
//  }
//  else {
//  res.status(400).json({ error: 'Invalid time range' });
//  return;
//  }
//  console.log(data)
//  res.json(data);

// const orderDatas = await OrderModel.find();

// // Function to group orders by status and date
// function groupOrdersByStatusAndDate(orderDatas) {
// const groupedData = {
// Shipped: {},
// Processing: {},
// Completed: {},
// Returned: {},
// };

// orderDatas.forEach((order) => {
// const status = order.order_status;
// const orderDate = moment(order.orderDate);

// // Group orders by day
// const day = orderDate.format('YYYY-MM-DD');

// if (!groupedData[status]) {
// groupedData[status] = {};
// }

// if (!groupedData[status][day]) {
// groupedData[status][day] = 0;
// }

// groupedData[status][day]++;
// });

// return groupedData;
// }

// // Function to generate date ranges
// function generateDateRanges(timeRange, count) {
// const startDate = moment().subtract(count - 1, timeRange);
// const dateRanges = [];

// for (let i = 0; i < count; i++) {
// dateRanges.push(startDate.clone().add(i, timeRange).format('YYYY-MM-DD'));
// }

// return dateRanges;
// }

// // Function to count orders in date ranges for each category
// function countOrdersInDateRangesByCategory(orderDatas, dateRanges) {
// const counts = {
// Shipped: Array(dateRanges.length).fill(0),
// Processing: Array(dateRanges.length).fill(0),
// Completed: Array(dateRanges.length).fill(0),
// Returned: Array(dateRanges.length).fill(0),
// };

// orderDatas.forEach((order) => {
// const status = order.order_status;
// const orderDate = moment(order.orderDate);

// dateRanges.forEach((dateRange, index) => {
// if (orderDate.isSameOrAfter(dateRange)) {
// counts[status][index]++;
// }
// });
// });

// return counts;
// }
// function convertDataForChart(timeRange, groupedData) {
//   if (timeRange === 'daily') {
//     return {
//       series: [
//         {
//           name: 'Shipped',
//           data: Object.values(groupedData.Shipped),
//         },
//         {
//           name: 'Processing',
//           data: Object.values(groupedData.Processing),
//         },
//         // Add series for Completed and Returned if needed
//       ],
//       categories: Object.keys(groupedData.Processing), // Assuming Processing has all dates
//     };
//   } else if (timeRange === 'weekly') {
//     const weeks = Object.keys(groupedData.Processing);
//     const series = Object.keys(groupedData).map((status) => ({
//       name: status,
//       data: weeks.map((week) => groupedData[status][week] || 0),
//     }));

//     return {
//       series,
//       categories: weeks,
//     };
//   } else if (timeRange === 'monthly') {
//     const months = Object.keys(groupedData.Processing);
//     const series = Object.keys(groupedData).map((status) => ({
//       name: status,
//       data: months.map((month) => groupedData[status][month] || 0),
//     }));

//     return {
//       series,
//       categories: months,
//     };
//   } else if (timeRange === 'yearly') {
//     const years = Object.keys(groupedData.Processing);
//     const series = Object.keys(groupedData).map((status) => ({
//       name: status,
//       data: years.map((year) => groupedData[status][year] || 0),
//     }));

//     return {
//       series,
//       categories: years,
//     };
//   }
//   return null; // Handle invalid time range
// }

// // Example usage
// const dailyDateRanges = generateDateRanges('days', 14);
// const weeklyDateRanges = generateDateRanges('weeks', 12);
// const monthlyDateRanges = generateDateRanges('months', 12);
// const yearlyDateRanges = generateDateRanges('years', 12);

// const groupedData = groupOrdersByStatusAndDate(orderData);
// const dailyCounts = countOrdersInDateRangesByCategory(orderData, dailyDateRanges);
// const weeklyCounts = countOrdersInDateRangesByCategory(orderData, weeklyDateRanges);
// const monthlyCounts = countOrdersInDateRangesByCategory(orderData, monthlyDateRanges);
// const yearlyCounts = countOrdersInDateRangesByCategory(orderData, yearlyDateRanges);

// console.log('grouped:', groupedData);
// console.log('daily:', dailyCounts);
// console.log('weekly:', weeklyCounts);
// console.log('monthly:', monthlyCounts);
// console.log('yearly:', yearlyCounts);

// } catch (error) {
// console.error(error.message);
// res.status(500).json({ error: 'Internal server error' });
// console.error('Error occurred:', error);
// console.error('Stack trace:', error.stack);
// }
// }

// module.exports ={
// loadChartData
// }
const OrderModel = require('../models/products/orderModels')
const moment = require('moment')
const UserModel = require('../models/userModels/userModel')
const AddressModel = require('../models/userModels/addressModel')

const loadChartData = async (req, res) => {
    try {
        const timeRange = req.params.timeRange
        console.log(timeRange)

        let orderData

        if (timeRange === 'weekly') {
            orderData = await fetchOrderDataForTimeRange('week')
        } else if (timeRange === 'monthly') {
            orderData = await fetchOrderDataForTimeRange('month')
        } else if (timeRange === 'yearly') {
            orderData = await fetchOrderDataForTimeRange('year')
        }

        if (orderData) {
            const groupedData = groupOrdersByStatusAndDate(orderData)
            const chartData = convertDataForChart(timeRange, groupedData)

            res.json(chartData)
        } else {
            res.status(400).json({ error: 'Invalid time range' })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: 'Internal server error' })
        console.error('Error occurred:', error)
        console.error('Stack trace:', error.stack)
    }
}

async function fetchOrderDataForTimeRange(timeRange) {
    const now = new Date()
    if (timeRange === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return await fetchOrderDataForDateRange(oneWeekAgo, now)
    } else if (timeRange === 'month') {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDayOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        )
        return await fetchOrderDataForDateRange(firstDayOfMonth, lastDayOfMonth)
    } else if (timeRange === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        const endOfYear = new Date(now.getFullYear(), 11, 31)
        return await fetchOrderDataForDateRange(startOfYear, endOfYear)
    }
}

async function fetchOrderDataForDateRange(startDate, endDate) {
    return await OrderModel.find({
        orderDate: { $gte: startDate, $lte: endDate },
    })
}

function groupOrdersByStatusAndDate(orderDatas) {
    const groupedData = {
        Shipped: {},
        Processing: {},
        Completed: {},
        Returned: {},
    }

    orderDatas.forEach((order) => {
        const status = order.order_status
        const orderDate = moment(order.orderDate)

        // Group orders by day
        const day = orderDate.format('YYYY-MM-DD')

        if (!groupedData[status]) {
            groupedData[status] = {}
        }

        if (!groupedData[status][day]) {
            groupedData[status][day] = 0
        }

        groupedData[status][day]++
    })

    return groupedData
}
function convertDataForChart(timeRange, groupedData) {
    if (timeRange === 'daily') {
        return {
            series: [
                {
                    name: 'Shipped',
                    data: Object.values(groupedData.Shipped),
                },
                {
                    name: 'Processing',
                    data: Object.values(groupedData.Processing),
                },
                // Add series for Completed and Returned if needed
            ],
            categories: Object.keys(groupedData.Processing), // Assuming Processing has all dates
        }
    } else if (timeRange === 'weekly') {
        const weeks = Object.keys(groupedData.Processing)
        const series = Object.keys(groupedData).map((status) => ({
            name: status,
            data: weeks.map((week) => groupedData[status][week] || 0),
        }))

        return {
            series,
            categories: weeks,
        }
    } else if (timeRange === 'monthly') {
        const months = Object.keys(groupedData.Processing)
        const series = Object.keys(groupedData).map((status) => ({
            name: status,
            data: months.map((month) => groupedData[status][month] || 0),
        }))

        return {
            series,
            categories: months,
        }
    } else if (timeRange === 'yearly') {
        const years = Object.keys(groupedData.Processing)
        const series = Object.keys(groupedData).map((status) => ({
            name: status,
            data: years.map((year) => groupedData[status][year] || 0),
        }))

        return {
            series,
            categories: years,
        }
    }
    return null // Handle invalid time range
}
//updating user address
const updateUserAddress = async(req,res)=>{
    try {
        const { userId, address1, address2, city, pin } = req.body;
        const userData = await UserModel.findById({_id:userId});

        if(!userData){
            res.status(400).json({ message: 'User not Found' });
        }else{
            await AddressModel.findOneAndUpdate({user_id:userId},{$set:
                {address1:address1,address2:address2,city:city,pin:pin}});
            res.status(200).json({ message: 'Address updated successfully' });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message:error.message})
    }
}

module.exports = {
    loadChartData,
    updateUserAddress
}
