import * as echarts from '../../ec-canvas/echarts'; // 导入echars

const db = wx.cloud.database({
    env: '' // 这里填你们的云开发环境
})

Page({
    data: {
        ecSexChart: {
            lazyLoad: true
        },
    },
    onLoad: function(options) {
        var that = this;
        this.getSexOption();

    },

    onReady: function() {
        //  根据设置，获取生成组件id <ec-canvas id="mychart-one" canvas-id="mychart-multi-one" ec="{{ ecSexChart}}"></ec-canvas>
        this.oneComponent = this.selectComponent('#mychart-one');
    },

    // 获取option数据
    getSexOption: function() {
        var that = this;

        // 这里根据云开发获取指定记录
        db.collection("dataAnalysis").where({
            communityId: "988c1b1b5ccaef2a0ac8358d5baa28de"
        }).get({
            success: function(res) {
                console.log(res.data[0])
                that.init_chart(res.data[0])  // 获取第一条记录
            }
        })
    },

    //初始化图表
    init_chart: function(data) {
        console.log(data.sex) // {1: 15, 2: 17}

        var strMap = obj2StrMap(data.sex) // 因为云开发不能存储map对象，所以存储的时候将map转换为obj，这里需要转换回map
        console.log(strMap) // Map(2) {"1" => 15, "2" => 17}

        var sexData = strMap2Array(strMap) // 转换为array
        console.log(sexData) // (2) [{value: 15, name: "男生"}, { value: 17, name: "女生" }]

        this.oneComponent.init((canvas, width, height) => {
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            setOption(chart, sexData) // 设置option
            this.chart = chart;
            return chart;
        });
    },
})

function setOption(chart, data) {
    const option = {
        series: [{
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: data,
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };

    chart.setOption(option)
}

/**
 * 对象 转换 纯字符串的Map
 */

function obj2StrMap(obj) {
    let strMap = new Map()
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k])
    }

    return strMap
}


/**
 * strMap 转 array
 */
function strMap2Array(strMap) {


    let data = new Array()

    strMap.forEach(function(value, key) {
        let obj = {
            value: 0,
            name: 0
        }

        // 因为获取到的key值1指代男生，2指代女生所以需要转化一下
        if (key == "2") {
            key = "女生"
        } else if (key == "1") {
            key = "男生"
        }
        obj.value = value;
        obj.name = key;
        data.push(obj)
    })

    return data;
}
