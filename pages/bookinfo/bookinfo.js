const app = getApp();
let util = require('../../utils/util.js');

Page({
  data: {
    hasUserInfo: false,
    loading: true,
    date: '',
    signaTop: app.globalData.signaTop,
    signaLeft: app.globalData.signaRight,
    signaHeight: app.globalData.signaHeight,
    isbn: '',
    error: false,
    cover_url: '',
    title: '',
    author: '',
    publish: '',
    book_intro: '',
    introShortText: '',
    author_intro: '',
    authorShortText: '',
    catalog: '',
    pages: null,
    rating: null,
    url: '',
    ifCollection: false,
    isAble: false,
    ifPopupShow: false,
    ifIntroShow: false,
    ifAuthorShow: false,
    setLoading: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    this.setData({
      hasUserInfo: wx.getStorageSync('hasUserInfo')
    })
    this.getTime();
    this.isNowReading(option.isbn);
    this.getBook(option.isbn);
    this.ifCollection(option.isbn);
  },

  goBack() {
    wx.navigateBack({
      delta: 1, // 返回上一级页面。
    })
  },
  getTime() {
    let date = util.formatDate(new Date());
    this.setData({
      date: date,
    });
  },
  isNowReading(e) {
    var isbn = wx.getStorageSync('isbn');
    if (e === isbn) {
      this.setData({
        isAble: false
      })
    } else {
      this.setData({
        isAble: true
      })
    };
  },
  getBook(isbn) {
    let that = this;
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/getBook.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        isbn: isbn
      },
      success: res => {
        console.log(res.data);
        var isTrue = res.data[0];
        var bookinfo1 = res.data[1];
        console.log(bookinfo1);

        if (isTrue == true) {
          that.setData({
            isbn: bookinfo1.isbn,
            cover_url: bookinfo1.cover_url,
            title: bookinfo1.title,
            author: bookinfo1.author,
            publish: bookinfo1.publish,
            book_intro: bookinfo1.book_intro,
            introShortText: bookinfo1.book_intro.slice(0, 55 ? 55 : 11) + '...',
            author_intro: bookinfo1.author_intro,
            authorShortText: bookinfo1.author_intro.slice(0, 55 ? 55 : 11) + '...',
            catalog: bookinfo1.catalog,
            pages: bookinfo1.pages,
            rating: bookinfo1.rating,
            url: bookinfo1.url,
            loading: false,
          })
        } else {
          wx.request({
            url: 'https://api.feelyou.top/isbn/' + isbn,
            data: {
              apikey: 'OWHagO3Wmkt0FLaZJTtgHxCzGDxHt0Uu'
            },
            success: function (res) {
              if (res.data.error) {
                console.log(res.data.error);
                that.setData({
                  error: true,
                  loading: false,
                })
              } else {
                let bookinfo2 = res.data;
                console.log(bookinfo2);

                that.setData({
                    isbn: bookinfo2.isbn,
                    cover_url: bookinfo2.cover_url,
                    title: bookinfo2.title,
                    author: bookinfo2.book_info['作者'],
                    publish: bookinfo2.book_info['出版社'],
                    book_intro: bookinfo2.book_intro,
                    introShortText: bookinfo2.book_intro.slice(0, 55 ? 55 : 11) + '...',
                    author_intro: bookinfo2.author_intro,
                    authorShortText: bookinfo2.author_intro.slice(0, 55 ? 55 : 11) + '...',
                    catalog: bookinfo2.catalog,
                    pages: bookinfo2.book_info['页数'],
                    rating: bookinfo2.rating.star_count,
                    url: bookinfo2.url,
                    loading: false,
                  }),
                  wx.request({
                    url: 'https://www.xiaoqw.online/recordreading/sever/saveBook.php',
                    method: 'POST',
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                      isbn: bookinfo2.isbn,
                      cover_url: bookinfo2.cover_url,
                      title: bookinfo2.title,
                      author: bookinfo2.book_info['作者'],
                      publish: bookinfo2.book_info['出版社'],
                      book_intro: bookinfo2.book_intro,
                      author_intro: bookinfo2.author_intro,
                      catalog: bookinfo2.catalog,
                      pages: bookinfo2.book_info['页数'],
                      rating: bookinfo2.rating.star_count,
                      url: bookinfo2.url,
                    },
                    success: res => {
                      console.log("获取书籍信息成功");
                    }
                  })
              }
            }
          })
        }
      }
    })
  },
  ifCollection(isbn) {
    var that = this;
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/ifCollection.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userID: wx.getStorageSync('userID'),
        isbn: isbn
      },
      success: res => {
        if (res.data === 1) {
          that.setData({
            ifCollection: true,
          })
        } else {
          that.setData({
            ifCollection: false,
          })
        }
      }
    })
  },
  collect() {
    let that = this;
    if (this.data.hasUserInfo) {
      wx.request({
        url: 'https://www.xiaoqw.online/recordreading/sever/collect.php',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          userID: wx.getStorageSync('userID'),
          isbn: that.data.isbn
        },
        success: res => {
          if (res.data === 1) {
            that.setData({
              ifCollection: true
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
      wx.showToast({
        title: '您尚未登陆',
        icon: 'none',
        duration: 2000
      })
    }
  },
  cancelCollect() {
    let that = this;
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/cancelCollect.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userID: wx.getStorageSync('userID'),
        isbn: that.data.isbn
      },
      success: res => {
        if (res.data === 1) {
          that.setData({
            ifCollection: false
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
  },
  showPopup() {
    if (this.data.hasUserInfo) {
      this.setData({
        ifPopupShow: true
      });
    } else {
      wx.showToast({
        title: '您尚未登陆',
        icon: 'none',
        duration: 2000
      })
    }
  },
  closePopup() {
    this.setData({
      ifPopupShow: false
    });
  },
  setNowReading() {
    let that = this;
    this.setData({
      setLoading: true
    })
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/addNowReading.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userID: wx.getStorageSync('userID'),
        isbn: that.data.isbn,
        startTime: that.data.date
      },
      success: function (res) {
        if (res.data) {
          console.log("设置成功");
          that.setData({
            setLoading: false
          })
          wx.setStorageSync('currentBook', that.data.isbn);
          wx.reLaunch({
            url: '/pages/tabbar/main/main'
          });
        } else {
          console.log("设置失败")
        }
      }
    })
  },
  ifIntroShow() {
    this.setData({
      ifIntroShow: !this.data.ifIntroShow
    })
  },
  ifAuthorShow() {
    this.setData({
      ifAuthorShow: !this.data.ifAuthorShow
    })
  },
  toClockIn() {
    wx.navigateTo({
      url: '../clockin/clockin?isbn=' + this.data.isbn
    })
  }
})