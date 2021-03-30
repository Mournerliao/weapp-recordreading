//获取应用实例
const app = getApp()

Page({
  data: {
    navHeight: app.globalData.navBarHeight,
    defaultValue: '',
    //星期数组
    weekText: ['Sun', 'Mon', 'Tus', 'Wed', 'Thu', 'Fri', 'Sat'],
    //月份数组
    monthText: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    lastMonth: '◀',
    nextMonth: '▶',
    //当月格子
    thisMonthDays: [],
    //上月格子
    empytGridsBefore: [],
    //下月格子
    empytGridsAfter: [],
    //显示日期
    title: '',
    //格式化日期
    format: '',

    year: 0,
    month: 0,
    date: 0,
    scrollLeft: 0,
    //常量 用于匹配是否为当天
    YEAR: 0,
    MONTH: 0,
    DATE: 0,
    recordView: ['当日记录', '全部记录'],
    show: false,

    ifCurrentRecord: true,
    ifAllRecord: true,
    currentRecords: [],
    allRecords: []
  },
  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    };
  },
  onLoad: function () {
    this.today();
  },
  select: function (e) {
    this.setData({
      selectVal: e.detail
    })
  },
  //滚动模式
  //当年当月当天 滚动到制定日期 否则滚动到当月1日
  scrollCalendar(year, month, date) {
    let currentDate = year + '-' + month + '-' + date;
    this.getCurrentRecords(currentDate);
    let that = this,
      scrollLeft = 0;
    wx.getSystemInfo({
      success(res) {
        let screenWidth = res.windowWidth / 375;
        //切换月份时 date为0
        if (date == 0) {
          scrollLeft = 0;
          //切换到当年当月 滚动到当日
          if (year == that.data.YEAR && month == that.data.MONTH) {
            scrollLeft = (that.data.DATE - 1) * 90;
          }
        } else {
          // 点选具体某一天 滚到到指定日期
          scrollLeft = (date - 1) * 90;
        }
        that.setData({
          scrollLeft: scrollLeft
        })
      }
    })
  },

  //初始化
  display: function (year, month, date) {
    this.setData({
      year,
      month,
      date,
      title: year + '，' + this.zero(month)
    })
    this.createDays(year, month);
    this.createEmptyGrids(year, month);

    //滚动模糊 初始界面
    this.scrollCalendar(year, month, date);
  },
  //默认选中当天 并初始化组件
  today: function () {
    let DATE = this.data.defaultValue ? new Date(this.data.defaultValue) : new Date(),
      year = DATE.getFullYear(),
      month = DATE.getMonth() + 1,
      date = DATE.getDate(),
      select = year + '-' + this.zero(month) + '-' + this.zero(date);

    this.setData({
      format: select,
      select: select,
      year: year,
      month: month,
      date: date,
      YEAR: year,
      MONTH: month,
      DATE: date,
    })

    //初始化日历组件UI
    this.display(year, month, date);

    //发送事件监听
    this.triggerEvent('select', select);
  },

  //选择 并格式化数据
  select: function (e) {
    let date = e.currentTarget.dataset.date,
      select = this.data.year + '-' + this.zero(this.data.month) + '-' + this.zero(date);
    this.setData({
      title: this.data.year + '，' + this.zero(this.data.month),
      select: select,
      year: this.data.year,
      month: this.data.month,
      date: date
    });

    //发送事件监听
    this.triggerEvent('select', select);

    //滚动日历到选中日期
    this.scrollCalendar(this.data.year, this.data.month, date);
  },
  //上个月
  lastMonth: function () {
    let month = this.data.month == 1 ? 12 : this.data.month - 1;
    let year = this.data.month == 1 ? this.data.year - 1 : this.data.year;
    //初始化日历组件UI
    this.display(year, month, 0);
  },
  //下个月
  nextMonth: function () {
    let month = this.data.month == 12 ? 1 : this.data.month + 1;
    let year = this.data.month == 12 ? this.data.year + 1 : this.data.year;
    //初始化日历组件UI
    this.display(year, month, 0);
  },
  //获取当月天数
  getThisMonthDays: function (year, month) {
    return new Date(year, month, 0).getDate();
  },
  // 绘制当月天数占的格子
  createDays: function (year, month) {
    let thisMonthDays = [],
      days = this.getThisMonthDays(year, month);
    for (let i = 1; i <= days; i++) {
      thisMonthDays.push({
        date: i,
        dateFormat: this.zero(i),
        monthFormat: this.zero(month),
        week: this.data.weekText[new Date(Date.UTC(year, month - 1, i)).getDay()]
      });
    }
    this.setData({
      thisMonthDays
    })
    // console.log('thisMonthDays', thisMonthDays)
  },
  //获取当月空出的天数
  createEmptyGrids: function (year, month) {
    //当月天数
    let thisMonthDays = this.getThisMonthDays(year, month),

      // 求出本月1号是星期几，本月前面空出几天，就是上月的日期
      // 0（周日） 到 6（周六）
      before = new Date(Date.UTC(year, month - 1, 1)).getDay(),

      // 后面空出的天数
      after = 7 - new Date(Date.UTC(year, month - 1, thisMonthDays)).getDay() - 1,

      empytGridsBefore = [],
      empytGridsAfter = [];
    //上月天数
    let preMonthDays = month - 1 < 0 ?
      this.getThisMonthDays(year - 1, 12) :
      this.getThisMonthDays(year, month - 1);

    //前面空出日期
    for (let i = 1; i <= before; i++) {
      empytGridsBefore.push(preMonthDays - (before - i));
    }

    // 后面空出的日期
    for (let i = 1; i <= after; i++) {
      empytGridsAfter.push(i);
    }
    this.setData({
      empytGridsAfter,
      empytGridsBefore
    })
  },
  //补全0
  zero: function (i) {
    return i >= 10 ? i : '0' + i;
  },

  selectView() {
    this.setData({
      show: true
    });
  },
  getCurrentRecords(date) {
    console.log(date);
    let that = this;
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/getCurrentRecords.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userID: wx.getStorageSync('userID'),
        isbn: wx.getStorageSync('isbn'),
        date: date
      },
      success: res => {
        console.log(res.data);

        if(res.data.length != 0) {
          that.setData({
            currentRecords: res.data,
            ifCurrentRecord: true
          })
        } else {
          console.log("暂无记录");
          that.setData({
            ifCurrentRecord: false
          })
        }
      }
    })
  },
  getAllRecords(event) {
    let that = this;
    if(event.detail.name == "all" && this.data.allRecords.length == 0) {
      wx.request({
        url: 'https://www.xiaoqw.online/recordreading/sever/getAllRecords.php',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          userID: wx.getStorageSync('userID'),
          isbn: wx.getStorageSync('isbn')
        },
        success: res => {
          console.log(res.data);
  
          if(res.data.length != 0) {
            that.setData({
              allRecords: res.data,
              ifAllRecord: true
            })
          } else {
            console.log("暂无记录");
            that.setData({
              ifAllRecord: false
            })
          }
        }
      })
    }
  }
})