const express = require("express");
const app = express();
const db = require("./db");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
//跨域
app.all("*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, mytoken");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Authorization");
  res.setHeader("Content-Type", "application/json;charset=utf-8");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Content-Length, Authorization, Accept,X-Requested-With"
  );
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  if (req.method == "OPTIONS") res.sendStatus(200);
  /*让options请求快速返回*/ else next();
});

const jwtKey = "loveyless";

// expressJwt中间件 验证token
app.use(
  expressJwt({
    credentialsRequired: true, //false不校验，游客也可以访问
    secret: jwtKey, //加密私钥，可换成别的
    algorithms: ["HS256"], //算法 ["HS256"]为默认值
  }).unless({
    path: ["/", "/api/addUser", "/api/test"], //添加不需要token验证的路由
  })
);

db.then(
  () => {
    console.log("mongo_true");

    //登陆逻辑
    app.post("/", (req, res) => {
      const { username, password } = req.body;

      // 生成token 4个参数
      jwt.sign(
        { username: username },
        jwtKey,
        {
          expiresIn: 3600 * 24 * 3,
        },
        (err, token) => {
          //还可以传个函数
          res.json({
            username,
            password,
            // token: "Bearer " + token, //token一般以"Bearer " Bearer加空格开始
            token,
          });
        }
      );

    });

    //进入主页
    app.get("/home", (req, res, next) => {

      res.json({
        payload: req.user,
      });

    });
  },
  (err) => {
    console.log("mongo_false", err);
  }
);

app.listen(9999, (err) => {
  !err && console.log("node true");
  err && console.log("node err", err.message);
});
