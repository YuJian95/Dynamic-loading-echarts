// 云函数入口文件
const cloud = require('wx-server-sdk')

// 这里需要配置测试环境
cloud.init({
    env: 'rollerworldtest-56f9d9'
})

const db = cloud.database()
const _ = db.command
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async(event, context) => {
    const wxContext = cloud.getWXContext()

    var Today = new Date().toDateString() // 获取年月日,时间为00:00

    var filter = {
        addClubDate: _.gte(new Date(Today)), // 获取当日加入社团的记录数 
        community: _.neq(null) // 社团不为空
    }

    const countResult = await db.collection('user').where(filter).count()

    const countTotal = countResult.total


    if (countTotal > 0) {
        const batchTimes = Math.ceil(countTotal / MAX_LIMIT)

        var clubList = new Map() // 保存,每天社团的新增记录数

        // 分页获取每个社团的记录数,并更新到总表
        for (let i = 0; i < batchTimes; i++) {

            db.collection('user').where(filter).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get().then(res => {
                var dataList = res.data // 记录总数
                mergeUserData(clubList, dataList) // 整合用户信息

                // 将数据写入表中
                updateDataAnalysis(clubList)
            })
        }
    }
}

/**
 * 整合数据
 * 将用户的性别,城市,省份提取整合
 */
function mergeUserData(clubList, dataList) {

    for (let i = 0; i < dataList.length; i++) {
        let doc = dataList[i] // 获取一条记录
        var clubData = {
            increase: 0,
            sex: new Map(),
            province: new Map(),
            city: new Map()
        }

        let communityId = doc.community
        let gender = doc.gender
        let city = doc.city
        let province = doc.province

        // 如果不存在,则新建
        if (!clubList.has(communityId)) {
            clubList.set(communityId, clubData)
        }

        var obj = clubList.get(communityId) // 获取clubData 

        obj.increase++;

        // 合并相同数据
        mergeSameData(obj.sex, gender)
        mergeSameData(obj.city, city)
        mergeSameData(obj.province, province)

    }
}

/**
 * 整合相同的元素
 */
function mergeSameData(map, key) {

    if (map.has(key)) {
        map.set(key, map.get(key) + 1)
    } else {
        map.set(key, 1)
    }

}

/**
 * 查找总表的记录,如果没有则添加
 */
function updateDataAnalysis(clubList) {

    clubList.forEach(function(value, key, map) {
        var id = key // 社团id
        var obj = value // 统计数据

        // 查找是否存在该记录

        // 新增记录
        db.collection("dataAnalysis").add({
            data: {
                communityId: id,
                date: new Date(),
                increase: obj.increase,
                city: strMap2Obj(obj.city),
                sex: strMap2Obj(obj.sex),
                province: strMap2Obj(obj.province)
            }
        })
    })
}

/**
 * 纯字符串map 转换 为普通对象
 */
function strMap2Obj(strMap) {
    let obj = new Object()
    for (let [k, v] of strMap) {
        obj[k] = v
    }

    return obj
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