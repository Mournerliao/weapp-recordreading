let util = require('../../utils/util.js');

Page({
  data: {
    loading: true,
    date: '',
    isbn: '',
    title: '',
    haveRead: 0,
    allpages: 0,
    readpages: 0,
    excerpt: '',
    note: '',
    baiduToken: '',
    showDialog1: false,
    showDialog2: false
  },
  onLoad: function (option) {
    console.log(option.isbn);
    this.getInfo();
    this.getTime();
  },
  getInfo() {
    let that = this;
    this.setData({
      hasUserInfo: wx.getStorageSync('hasUserInfo')
    })
    if (wx.getStorageSync('userID')) {
      let userID = wx.getStorageSync('userID');
      wx.request({
        url: 'https://www.xiaoqw.online/recordreading/sever/getClockInInfo.php',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          userID: userID,
          isbn: wx.getStorageSync('isbn')
        },
        success: function (res) {
          console.log(res.data);
          if (res.data) {
            that.setData({
              isbn: res.data.isbn,
              title: res.data.title,
              haveRead: res.data.haveRead,
              allpages: res.data.pages,
              loading: false
            });
          } else {
            console.log("未获取到信息!");
          }
        }
      })
    }
  },
  getTime() {
    let date = util.formatDate(new Date());
    this.setData({
      date: date,
    });
  },
  onClickLeft() {
    wx.navigateBack({
      delta: 1, // 返回上一级页面。
    })
  },
  thisRead(event) {
    console.log(event.detail.value);
    this.setData({
      readpages: event.detail.value
    })
  },
  // 获取百度access_token  
  getBaiduToken: function () {
    var apiKey = 'lZaAUGe7f7z6tzvIUyTx8D6g';
    var secKey = 'lxHFGYqRyiIQ1iGbQdf9G9aU8wGPIdjs';
    var tokenUrl = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secKey}`;
    var that = this;

    wx.request({
      url: tokenUrl,
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json; charset-UTF-8'
      },
      success: function (res) {
        console.log("[BaiduToken获取成功]");
        that.setData({
          baiduToken: res.data.access_token
        })
      },
      fail: function (res) {
        console.log("[BaiduToken获取失败]", res);
      }
    })
  },
  // 百度ORC接口调用  
  scanImageInfo: function (imageData) { // 这里的imageData是图片转换成base64格式的数据
    var that = this;

    const detectUrl = `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${that.data.baiduToken}` // baiduToken是已经获取的access_Token

    return new Promise(function (resolve, reject) {
      wx.request({
        url: detectUrl,
        data: {
          image: imageData
        },
        method: 'POST',
        dataType: 'json',
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 必须的        
        },
        success: function (res, resolve) {
          console.log('get word success：', res.data);
          var words = that.joinWords(res.data.words_result);
          console.log(words);

          that.setData({
            excerpt: words
          })
        },
        fail: function (res, reject) {
          console.log('get word fail：', res.data);
        },
      })
    })
  },
  // 上传图片实现OCR
  doUpload: function () {
    var that = this
    that.getBaiduToken() // 提前获取access_Token

    // 选择图片，拍照或从相册中获取
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const filePath = res.tempFilePaths[0]
        // 上传图片        
        wx.getFileSystemManager().readFile({
          filePath: filePath,
          encoding: 'base64',
          success: function (res) {
            wx.showLoading({
              title: '正在识别',
            })
            console.log("[读取图片数据success]");
            that.scanImageInfo(res.data); // 调用百度API解析图片获取文字      
          },
          fail: function (res) {
            console.log("[读取图片数据fail]", res)
          },
          complete: function (res) {
            wx.hideLoading();
          }
        })
      }
    })
  },
  joinWords(words_result) {
    var words = '';
    for (let i = 0; i < words_result.length; i++) {
      words += words_result[i].words;
    }
    return words
  },
  myExcerpt(event) {
    console.log(event.detail.value);
    this.setData({
      excerpt: event.detail.value
    })
  },
  myNote(event) {
    console.log(event.detail.value);
    this.setData({
      note: event.detail.value
    })
  },
  showExcerptDialog() {
    this.setData({
      showDialog1: true
    })
  },
  showNoteDialog() {
    this.setData({
      showDialog2: true
    })
  },
  onClose1() {
    this.setData({
      showDialog1: false
    })
  },
  onClose2() {
    this.setData({
      showDialog2: false
    })
  },
  clearExcerpt() {
    this.setData({
      excerpt: ''
    })
  },
  clearNote() {
    this.setData({
      note: ''
    })
  },
  submit() {
    if (parseInt(this.data.readpages) <= 0) {
      wx.showToast({
        title: '输入的页数应大于0',
        icon: 'none',
        duration: 2000
      })
    } else if (parseInt(this.data.readpages) > parseInt(this.data.allpages)) {
      wx.showToast({
        title: '不能大于书籍页数',
        icon: 'none',
        duration: 2000
      })
    } else if (parseInt(this.data.readpages) <= parseInt(this.data.haveRead)) {
      wx.showToast({
        title: '书可不能读回去噢',
        icon: 'none',
        duration: 2000
      })
    } else {
      let that = this;
      console.log(that.data.note)
      if (parseInt(this.data.readpages) == parseInt(this.data.allpages)) {
        wx.request({
          url: 'https://www.xiaoqw.online/recordreading/sever/finishReading.php',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            userID: wx.getStorageSync('userID'),
            isbn: that.data.isbn,
            readPages: that.data.readpages,
            thisRead: that.data.readpages - that.data.haveRead,
            excerpt: that.data.excerpt,
            note: that.data.note,
            endTime: that.data.date
          },
          success: res => {
            console.log(res.data);
            if (res.data === 1) {
              wx.reLaunch({
                  url: '/pages/tabbar/main/main',
                }),
                wx.removeStorageSync('isbn');
              wx.removeStorageSync('currentBook');
              wx.showToast({
                title: '恭喜您完成本书的阅读🎉',
                icon: 'none',
                duration: 2000
              })
            } else {
              wx.showToast({
                title: '操作未成功，请再试一次',
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      } else {
        wx.request({
          url: 'https://www.xiaoqw.online/recordreading/sever/saveRecord.php',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            userID: wx.getStorageSync('userID'),
            isbn: that.data.isbn,
            readPages: that.data.readpages,
            thisRead: that.data.readpages - that.data.haveRead,
            excerpt: that.data.excerpt,
            note: that.data.note
          },
          success: res => {
            // console.log(res.data);
            if (res.data === 1) {
              wx.reLaunch({
                  url: '/pages/tabbar/main/main',
                }),
                wx.showToast({
                  title: '打卡成功',
                  icon: 'success',
                  duration: 2000
                })
            } else {
              wx.showToast({
                title: '操作未成功，请再试一次',
                icon: 'none',
                duration: 2000
              })
            }
          }
        })
      }
    }
  }
})