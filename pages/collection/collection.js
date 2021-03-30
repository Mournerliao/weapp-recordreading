Page({
  data: {
    loading: true,
    books: []
  },
  onLoad() {
    
  },
  onShow() {
    this.getCollection();
  },
  onClickLeft() {
    wx.navigateBack({
      delta: 1, // 返回上一级页面。
    })
  },
  getCollection() {
    let that = this;
    wx.request({
      url: 'https://www.xiaoqw.online/recordreading/sever/getCollection.php',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        userID: wx.getStorageSync('userID')
      },
      success: res => {
        console.log(res.data);
        that.setData({
          books: res.data,
          loading: false
        })
      }
    })
  },
  toBookInfo(event) {
    let isbn = event.currentTarget.dataset.isbn;
    wx.navigateTo({
      url: '../bookinfo/bookinfo?isbn=' + isbn
    })
  },
})