//获取应用实例
const app = getApp();
import Poster from '../../../miniprogram_npm/wxa-plugin-canvas/poster/poster';

Page({
  data: {
    hasUserInfo: false,
    loading: false,
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
    allRecords: [],
    dialogShow: false,
    sortShow: false,
    currentDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      }
      return `${value}日`;
    },
    startDate: '',
    endDate: '',

    posterConfig: {
      width: 750,
      height: 1380,
      backgroundColor: '#ffffff',
      debug: false,
      pixelRatio: 1,
      blocks: [{
        x: 0,
        y: 980,
        width: 750,
        height: 50,
        paddingLeft: 65,
        paddingRight: 65,
        borderWidth: 0,
        backgroundColor: '#ffffff',
        text: {
          text: [{
            text: '',
            fontSize: 32,
            color: '#303133',
            textAlign: 'left'
          }]
        }
      }, {
        x: 0,
        y: 1110,
        width: 750,
        height: 270,
        paddingLeft: 0,
        paddingRight: 0,
        borderWidth: 0,
        backgroundColor: '#f0f1f5',
        zIndex: 5
      }],
      texts: [{
        x: 210,
        y: 560,
        baseLine: 'middle',
        text: '',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#303133',
        textAlign: 'left'
      }, {
        x: 65,
        y: 660,
        baseLine: 'top',
        text: '',
        fontSize: 32,
        color: '#303133',
        textAlign: 'left'
      }, {
        x: 65,
        y: 720,
        baseLine: 'top',
        text: '',
        fontSize: 32,
        color: '#303133',
        textAlign: 'left'
      }, {
        x: 65,
        y: 780,
        baseLine: 'top',
        text: '',
        fontSize: 32,
        color: '#303133',
        textAlign: 'left'
      }, {
        x: 65,
        y: 840,
        baseLine: 'top',
        text: '',
        fontSize: 32,
        color: '#303133',
        textAlign: 'left'
      }, {
        x: 65,
        y: 920,
        baseLine: 'top',
        text: '',
        fontSize: 32,
        color: '#303133',
        textAlign: 'left'
      }, {
        x: 265,
        y: 1190,
        baseLine: 'top',
        text: '长按识别小程序码',
        lineHeight: 40,
        fontSize: 32,
        color: '#000000',
        textAlign: 'left',
        zIndex: 10
      }, {
        x: 265,
        y: 1250,
        baseLine: 'top',
        text: '来「你阅读了吗」记录你的读书历程',
        lineHeight: 30,
        fontSize: 28,
        color: '#606266',
        textAlign: 'left',
        zIndex: 10
      }],
      images: [{
          width: 750,
          height: 470,
          x: 0,
          y: 0,
          borderRadius: 0,
          url: 'https://www.xiaoqw.online/recordreading/source/Reading.png',
        }, {
          width: 120,
          height: 120,
          x: 60,
          y: 500,
          borderRadius: 120,
          url: '',
        },
        {
          width: 180,
          height: 180,
          x: 45,
          y: 1145,
          borderRadius: 180,
          url: 'https://www.xiaoqw.online/recordreading/source/weappCode.png',
          zIndex: 10,
          borderWidth: 20,
          borderColor: '#ffffff'
        }
      ]
    },
    poster: false
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
    this.setData({
      hasUserInfo: wx.getStorageSync('hasUserInfo')
    })
    this.today();
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  //分享功能
  onShareAppMessage(res) {
    return {
      title: "记录你的读书历程",
      // imageUrl: "https://www.xiaoqw.online/recordreading/source/shareImgTop.png",
      path: "/pages/tabbar/main/main"
    }
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
    this.setData({
      loading: true
    })
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

    this.setData({
      loading: false
    })
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
    // console.log('thisMonthDays', thisMonthDays);
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

    if (this.data.hasUserInfo) {
      wx.request({
        url: 'https://www.xiaoqw.online/recordreading/sever/getCurrentRecords.php',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          userID: wx.getStorageSync('userID'),
          date: date
        },
        success: res => {
          console.log(res.data);
          res.data.reverse();
          if (res.data.length != 0) {
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
    } else {
      that.setData({
        ifCurrentRecord: false
      })
    }
  },
  getAllRecords(event) {
    let that = this;
    if (this.data.hasUserInfo) {
      if (event.detail.name == "all" && this.data.allRecords.length == 0) {
        wx.request({
          url: 'https://www.xiaoqw.online/recordreading/sever/getAllRecords.php',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            userID: wx.getStorageSync('userID')
          },
          success: res => {
            console.log(res.data);
            res.data.reverse();
            if (res.data.length != 0) {
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
    } else {
      that.setData({
        ifAllRecord: false
      })
    }
  },
  toExport() {
    if (this.data.hasUserInfo) {
      this.setData({
        dialogShow: true
      })
    } else {
      wx.showToast({
        title: '您尚未登陆',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onClose() {
    this.setData({
      dialogShow: false
    });
  },
  selectStartDate(event) {
    let time = new Date(event.detail); //根据时间戳生成的时间对象
    let startDate = (time.getFullYear()) + "-" + (time.getMonth() + 1) + "-" + (time.getDate());
    this.setData({
      startDate: startDate
    })
  },
  selectEndDate(event) {
    let time = new Date(event.detail); //根据时间戳生成的时间对象
    let endDate = (time.getFullYear()) + "-" + (time.getMonth() + 1) + "-" + (time.getDate());
    this.setData({
      endDate: endDate
    })
  },
  closeShare() {
    this.setData({
      showShare: false
    })
  },
  showSelectSort() {
    let email = wx.getStorageSync('email');

    if (email == '') {
      wx.showToast({
        title: '您尚未设置邮箱',
        icon: 'none',
        duration: 2000
      })
    } else {
      this.setData({
        sortShow: true
      })
    }
  },
  closeSelectSort() {
    this.setData({
      sortShow: false
    })
  },
  exportPDFByTime() {
    let that = this;

    wx.showLoading({
      mask: true,
      title: '正在导出'
    });

    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/exportPDF.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userID: wx.getStorageSync('userID'),
        name: wx.getStorageSync('name'),
        startDate: that.data.startDate,
        endDate: that.data.endDate,
        email: wx.getStorageSync('email')
      },
      success: res => {
        if (res.data === 1) {
          wx.hideLoading();
          wx.showToast({
            title: '阅读记录已发送',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            sortShow: false
          })
        } else {
          wx.hideLoading();
          wx.showToast({
            title: '操作未成功，请再试一次',
            icon: 'none',
            duration: 2000
          })
          that.setData({
            sortShow: false
          })
        }
      }
    })
  },
  exportPDFByName() {
    wx.showToast({
      title: '敬请期待',
      icon: 'none'
    })
  },
  onCreatePoster() {
    let that = this;
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/exportPoster.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userID: wx.getStorageSync('userID'),
        startDate: that.data.startDate,
        endDate: that.data.endDate
      },
      success: res => {
        console.log(res.data);

        let days, books, records, pages, max, title;
        days = that.data.startDate + ' 至 ' + that.data.endDate + ' 共 ' + res.data.totalDays + ' 天';
        books = '您一共阅读了 ' + res.data.totalBooks + ' 本书';
        records = '打卡了 ' + res.data.totalRecords + ' 次';
        pages = '共 ' + res.data.totalPages + ' 页';

        if (!res.data.max) {
          max = '看起来您对它们一视同仁';
          title = ''
        } else {
          max = '其中打卡次数最多的书籍是';
          title = '《' + res.data.max + '》'
        }

        that.setData({
          ['posterConfig.images[' + 1 + '].url']: wx.getStorageSync('imgUrl'),
          ['posterConfig.texts[' + 0 + '].text']: wx.getStorageSync('name'),
          ['posterConfig.texts[' + 1 + '].text']: days,
          ['posterConfig.texts[' + 2 + '].text']: books,
          ['posterConfig.texts[' + 3 + '].text']: records,
          ['posterConfig.texts[' + 4 + '].text']: pages,
          ['posterConfig.texts[' + 5 + '].text']: max,
          ['posterConfig.blocks[' + 0 + '].text.text[' + 0 + '].text']: title,
        }, () => {
          Poster.create(true); // 入参：true为抹掉重新生成
          that.setData({
            poster: true
          })
        });
      }
    });
  },
  onPosterSuccess(e) {
    const {
      detail
    } = e;
    wx.previewImage({
      current: detail,
      urls: [detail]
    })
  },
  onPosterFail(err) {
    console.error(err);
  },
})