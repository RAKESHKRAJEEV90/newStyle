;(function (jQuery) {
    'use strict'
    if (document.querySelectorAll('#myChart').length) {
        const options = {
            series: [55, 75],
            chart: {
                height: 230,
                type: 'radialBar',
            },
            colors: ['#4bc7d2', '#3a57e8'],
            plotOptions: {
                radialBar: {
                    hollow: {
                        margin: 10,
                        size: '50%',
                    },
                    track: {
                        margin: 10,
                        strokeWidth: '50%',
                    },
                    dataLabels: {
                        show: false,
                    },
                },
            },
            labels: ['Apples', 'Oranges'],
        }
        if (ApexCharts !== undefined) {
            const chart = new ApexCharts(
                document.querySelector('#myChart'),
                options
            )
            chart.render()
            document.addEventListener('ColorChange', (e) => {
                const newOpt = { colors: [e.detail.detail2, e.detail.detail1] }
                chart.updateOptions(newOpt)
            })
        }
    }
    if (document.querySelectorAll('#d-activity').length) {
        const options = {
            series: [
                {
                    name: 'Successful deals',
                    data: [30, 50, 35, 60, 40, 60, 60, 30, 50, 35],
                },
                {
                    name: 'Failed deals',
                    data: [40, 50, 55, 50, 30, 80, 30, 40, 50, 55],
                },
            ],
            chart: {
                type: 'bar',
                height: 230,
                stacked: true,
                toolbar: {
                    show: false,
                },
            },
            colors: ['#3a57e8', '#4bc7d2'],
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '28%',
                    endingShape: 'rounded',
                    borderRadius: 5,
                },
            },
            legend: {
                show: false,
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent'],
            },
            xaxis: {
                categories: ['S', 'M', 'T', 'W', 'T', 'F', 'S', 'M', 'T', 'W'],
                labels: {
                    minHeight: 20,
                    maxHeight: 20,
                    style: {
                        colors: '#8A92A6',
                    },
                },
            },
            yaxis: {
                title: {
                    text: '',
                },
                labels: {
                    minWidth: 19,
                    maxWidth: 19,
                    style: {
                        colors: '#8A92A6',
                    },
                },
            },
            fill: {
                opacity: 1,
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return '$ ' + val + ' thousands'
                    },
                },
            },
        }

        const chart = new ApexCharts(
            document.querySelector('#d-activity'),
            options
        )
        chart.render()
        document.addEventListener('ColorChange', (e) => {
            const newOpt = { colors: [e.detail.detail1, e.detail.detail2] }
            chart.updateOptions(newOpt)
        })
    }
    // if (document.querySelectorAll('#d-main').length) {
    //   const options = {
    //       series: [{
    //           name: 'total',
    //           data: [94, 80, 94, 80, 94, 80, 94]
    //       }, {
    //           name: 'pipline',
    //           data: [72, 60, 84, 60, 74, 60, 78]
    //       }],
    //       chart: {
    //           fontFamily: '"Inter", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    //           height: 245,
    //           type: 'area',
    //           toolbar: {
    //               show: false
    //           },
    //           sparkline: {
    //               enabled: false,
    //           },
    //       },
    //       colors: ["#3a57e8", "#4bc7d2"],
    //       dataLabels: {
    //           enabled: false
    //       },
    //       stroke: {
    //           curve: 'smooth',
    //           width: 3,
    //       },
    //       yaxis: {
    //         show: true,
    //         labels: {
    //           show: true,
    //           minWidth: 19,
    //           maxWidth: 19,
    //           style: {
    //             colors: "#8A92A6",
    //           },
    //           offsetX: -5,
    //         },
    //       },
    //       legend: {
    //           show: false,
    //       },
    //       xaxis: {
    //           labels: {
    //               minHeight:22,
    //               maxHeight:22,
    //               show: true,
    //               style: {
    //                 colors: "#8A92A6",
    //               },
    //           },
    //           lines: {
    //               show: false  //or just here to disable only x axis grids
    //           },
    //           categories: ["Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Aug"]
    //       },
    //       grid: {
    //           show: false,
    //       },
    //       fill: {
    //           type: 'gradient',
    //           gradient: {
    //               shade: 'dark',
    //               type: "vertical",
    //               shadeIntensity: 0,
    //               gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
    //               inverseColors: true,
    //               opacityFrom: .4,
    //               opacityTo: .1,
    //               stops: [0, 50, 80],
    //               colors: ["#3a57e8", "#4bc7d2"]
    //           }
    //       },
    //       tooltip: {
    //         enabled: true,
    //       },
    //   };

    //   const chart = new ApexCharts(document.querySelector("#d-main"), options);
    //   chart.render();
    //   document.addEventListener('ColorChange', (e) => {
    //     console.log(e)
    //     const newOpt = {
    //       colors: [e.detail.detail1, e.detail.detail2],
    //       fill: {
    //         type: 'gradient',
    //         gradient: {
    //             shade: 'dark',
    //             type: "vertical",
    //             shadeIntensity: 0,
    //             gradientToColors: [e.detail.detail1, e.detail.detail2], // optional, if not defined - uses the shades of same color in series
    //             inverseColors: true,
    //             opacityFrom: .4,
    //             opacityTo: .1,
    //             stops: [0, 50, 60],
    //             colors: [e.detail.detail1, e.detail.detail2],
    //         }
    //     },
    //    }
    //     chart.updateOptions(newOpt)
    //   })
    // }
    if ($('.d-slider1').length > 0) {
        const options = {
            centeredSlides: false,
            loop: false,
            slidesPerView: 4,
            autoplay: false,
            spaceBetween: 32,
            breakpoints: {
                320: { slidesPerView: 1 },
                550: { slidesPerView: 2 },
                991: { slidesPerView: 3 },
                1400: { slidesPerView: 3 },
                1500: { slidesPerView: 4 },
                1920: { slidesPerView: 6 },
                2040: { slidesPerView: 7 },
                2440: { slidesPerView: 8 },
            },
            pagination: {
                el: '.swiper-pagination',
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },

            // And if we need scrollbar
            scrollbar: {
                el: '.swiper-scrollbar',
            },
        }
        let swiper = new Swiper('.d-slider1', options)

        document.addEventListener('ChangeMode', (e) => {
            if (e.detail.rtl === 'rtl' || e.detail.rtl === 'ltr') {
                swiper.destroy(true, true)
                setTimeout(() => {
                    swiper = new Swiper('.d-slider1', options)
                }, 500)
            }
        })
    }

    // chart.js
    // Data for the weekly chart
    const weeklyOptions = {
        series: [
            {
                name: 'Sales',
                data: [10, 15, 8, 12, 7, 9, 11], // Replace with your weekly sales data
            },
            {
                name: 'Cost',
                data: [5, 8, 6, 7, 4, 5, 6], // Replace with your weekly cost data
            },
        ],
        chart: {
            height: 300,
            type: 'area',
            toolbar: {
                show: false,
            },
        },
        colors: ['#3a57e8', '#4bc7d2'],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        xaxis: {
            labels: {
                show: true,
                style: {
                    colors: '#8A92A6',
                },
            },
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        grid: {
            show: false,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0,
                gradientToColors: ['#3a57e8', '#4bc7d2'],
                inverseColors: true,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 50, 80],
                colors: ['#3a57e8', '#4bc7d2'],
            },
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: function (val) {
                    return '$ ' + val + 'K'
                },
            },
        },
    }

    // Data for the monthly chart
    const monthlyOptions = {
        series: [
            {
                name: 'Sales',
                data: [], // Replace with your monthly sales data
            },
            {
                name: 'Costs',
                data: [], // Replace with your monthly cost data
            },
        ],
        chart: {
            height: 300,
            type: 'area',
            toolbar: {
                show: false,
            },
        },
        colors: ['#3a57e8', '#4bc7d2'],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        xaxis: {
            labels: {
                show: true,
                style: {
                    colors: '#8A92A6',
                },
            },
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        },
        grid: {
            show: false,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0,
                gradientToColors: ['#3a57e8', '#4bc7d2'],
                inverseColors: true,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 50, 80],
                colors: ['#3a57e8', '#4bc7d2'],
            },
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: function (val) {
                    return '$ ' + val + 'K'
                },
            },
        },
    }

    // Data for the yearly chart
    const yearlyOptions = {
        series: [
            {
                name: 'Sales',
                data: [
                    800, 900, 1100, 950, 1200, 1050, 1300, 1100, 1000, 1150,
                    900, 1000,
                ], // Replace with your yearly sales data
            },
            {
                name: 'Costes',
                data: [
                    600, 750, 900, 800, 950, 850, 1100, 900, 800, 950, 700, 800,
                ], // Replace with your yearly cost data
            },
        ],
        chart: {
            height: 300,
            type: 'area',
            toolbar: {
                show: false,
            },
        },
        colors: ['#3a57e8', '#4bc7d2'],
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        xaxis: {
            labels: {
                show: true,
                style: {
                    colors: '#8A92A6',
                },
            },
            categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ],
        },
        grid: {
            show: false,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0,
                gradientToColors: ['#3a57e8', '#4bc7d2'],
                inverseColors: true,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 50, 80],
                colors: ['#3a57e8', '#4bc7d2'],
            },
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: function (val) {
                    return '$ ' + val + 'K'
                },
            },
        },
    }

    // Create ApexCharts instances for the weekly, monthly, and yearly charts
    const weeklyChart = new ApexCharts(
        document.querySelector('#weeklyChart'),
        weeklyOptions
    )
    const monthlyChart = new ApexCharts(
        document.querySelector('#monthlyChart'),
        monthlyOptions
    )
    const yearlyChart = new ApexCharts(
        document.querySelector('#yearlyChart'),
        yearlyOptions
    )

    // Function to fetch data from the server for a specific time range and update the chart
    function fetchDataAndRenderChart(timeRange, chart) {
        $.ajax({
            url: `/api/getChartData/${timeRange}`, // Adjust the URL as needed
            method: 'GET',
            success: function (data) {
                console.log(data)

                // Check if 'data' has the expected structure (e.g., 'series' and 'categories' properties)
                if (data.series && data.categories) {
                    // Update the series and categories in the chart options
                    const updatedOptions = {
                        series: data.series,
                        xaxis: {
                            categories: data.categories,
                        },
                    }

                    // Update the chart with the modified options
                    chart.updateOptions(updatedOptions)
                } else {
                    console.error('Invalid data received from the server')
                }
            },
            error: function (error) {
                console.error('Error fetching data:', error)
            },
        })
    }
    // Event listener for dropdown selection
    document.addEventListener('DOMContentLoaded', function () {
        const dropdownItems = document.querySelectorAll('.drop-it')

        dropdownItems.forEach(function (item) {
            item.addEventListener('click', function (event) {
                event.preventDefault()
                const timeRange = event.target.getAttribute('data-chart')
                let selectedChart
                console.log(timeRange)
                if (timeRange === 'weekly') {
                    selectedChart = weeklyChart
                } else if (timeRange === 'monthly') {
                    selectedChart = monthlyChart
                } else if (timeRange === 'yearly') {
                    selectedChart = yearlyChart
                }

                // Fetch and update the selected chart based on user selection
                if (selectedChart) {
                    fetchDataAndRenderChart(timeRange, selectedChart)
                }
            })
        })
    })

    // Render the initial charts
    weeklyChart.render()
    monthlyChart.render()
    yearlyChart.render()
})(jQuery)
