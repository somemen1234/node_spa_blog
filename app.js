const express = require("express");
const app = express();
const port = 3000;

const commentsRouter = require("./routes/comments.js");
//posts.js에서 객체로 감쌌기 때문에 해당 객체를 require할 때에도 객체로 불러옴
//이 때, :뒤의 변수명은 AS로 postsRouter로 사용하기 위해 설정
const { router: postsRouter } = require("./routes/posts.js");
const connect = require("./schemas");
connect();

app.use(express.json());
app.use("/", [postsRouter, commentsRouter]);

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
