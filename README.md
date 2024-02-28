### 自动签到

#### 获取jd cookies

```
  var CV = 'header里获取到的cookie';
  var CookieValue = CV.match(/pt_pin=.+?;/) + CV.match(/pt_key=.+?;/);
  copy(CookieValue);
```

### cookies格式

`pt_pin=***;pt_key=***;`
