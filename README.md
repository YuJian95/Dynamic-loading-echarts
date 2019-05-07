# Dynamic-loading-echarts
A demo of WeChat applet **dynamic loading echarts** .

### 描述

通过云开发获取用户数据,动态的显示图表信息.

### 需要修改的地方

1. 修改云开发id

```JS
// pages/index.js

const db = wx.cloud.database({
    env: '' // 这里填你们的云开发环境
})

```

2. 设置数据

这里我存储的数据是以object存储的,然后获取后将data转为Array类型(echarts显示数据的格式)

```json

{
	"男生" : 1,
	"女生" : 2,
}

```


3. 配置查询


这里设置查询`dataAnalysis`中指定 记录id 的id号.

```JS
// pages/index.js

        // 这里根据云开发获取指定记录
        db.collection("dataAnalysis").where({
            communityId: "记录id"
        }).get({
            success: function(res) {
                console.log(res.data[0])
                that.init_chart(res.data[0])  // 获取第一条记录
            }
        })
```
