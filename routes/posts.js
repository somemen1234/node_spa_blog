const express = require("express");
const router = express.Router();

const Post = require("../schemas/post.js");
const Comment = require("../schemas/comment.js");
//ObjectId의 타입을 활용하기 위해 할당
const { ObjectId } = require("mongoose").Types;

//시스템 강제 종료되는 부분을 예외 처리
//기본 검색이 ObjectId형식으로 검색을 하다보니 형식에 맞지 않으면 강제 종료가 되어 버림.
//강제 종료를 막기 위해 try catch를 사용했는데, 거의 모든 함수에서 사용해서 따로 함수로 선언
const checkObjectId = (req, res, next) => {
  const { _postId } = req.params;
  try {
    if (!ObjectId.isValid(_postId)) {
      throw Error("데이터 형식이 올바르지 않습니다.");
    }
    next();
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

//전체 게시글 목록 조회
//생성일자별 내림차 순으로 정렬
router.get("/posts", async (_, res) => {
  const posts = await Post.find({}).sort({ createdAt: -1 });

  const results = posts.map((post) => {
    return {
      postId: post._id,
      user: post.user,
      title: post.title,
      createdAt: post.createdAt,
    };
  });

  if (results.length === 0)
    return res.status(404).json({ success: false, message: "작성된 게시글이 없습니다." });

  res.status(200).json({ success: true, data: results });
});

//게시글 등록하기
//모든 정보 입력하도록 validation check
router.post("/posts", async (req, res) => {
  const { user, password, title, content } = req.body;

  if (!user || !password || !title || !content)
    return res
      .status(400)
      .json({ success: false, message: "게시글의 정보가 입력되지 않았습니다." });

  await Post.create({ user, password, title, content });
  res.status(201).json({ success: true, message: "게시글을 생성하였습니다" });
});

//게시글 조회(_id를 통해서)
router.get("/posts/:_postId", checkObjectId, async (req, res) => {
  const { _postId } = req.params;

  const result = await Post.findOne({ _id: new ObjectId(_postId) });

  if (!result) return res.status(404).json({ success: false, message: "해당 id가 없습니다." });

  res.status(200).json({
    success: true,
    data: {
      postId: result._id,
      user: result.user,
      title: result.title,
      content: result.content,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    },
  });
});

//게시글 수정
//동일한 비밀번호 입력시에만 수정이 되도록 구현
router.put("/posts/:_postId", checkObjectId, async (req, res) => {
  const { _postId } = req.params;
  const { user, password, title, content } = req.body;

  if (!password)
    return res
      .status(400)
      .json({ success: false, message: "게시글의 비밀번호가 입력되지 않았습니다." });

  const existPost = await Post.findOne(new ObjectId(_postId));
  if (!existPost)
    return res.status(404).json({ success: false, message: "게시글 조회에 실패하였습니다." });

  if (existPost.password !== password)
    return res.status(400).json({ success: false, message: "게시글의 비밀번호가 다릅니다." });

  await Post.updateOne(
    { _id: new ObjectId(_postId) },
    {
      $set: { user: user, title: title, content: content, updatedAt: existPost.updatedAt },
    }
  );
  res.status(201).json({ success: true, message: "게시글을 수정하였습니다." });
});

//게시글 삭제
//동일한 비밀번호 입력시에만 삭제 되도록 구현
router.delete("/posts/:_postId", checkObjectId, async (req, res) => {
  const { _postId } = req.params;
  const { password } = req.body;

  if (!password)
    return res
      .status(400)
      .json({ success: false, message: "게시글의 비밀번호가 입력되지 않았습니다." });

  const existPost = await Post.findOne(new ObjectId(_postId));
  if (!existPost)
    return res.status(404).json({ success: false, message: "게시글 조회에 실패하였습니다." });

  if (existPost.password !== password)
    return res.status(400).json({ success: false, message: "게시글의 비밀번호가 다릅니다." });

  await Post.deleteOne(new ObjectId(_postId));
  await Comment.deleteMany({ _postId: new ObjectId(_postId) });
  return res.status(200).json({ success: true, message: "게시글을 삭제하였습니다." });
});

//router외의 오류예외처리 함수도 내보낼 수 있도록 객체로 감쌌음
//하나의 js에서는 하나의 모듈만 exports가 가능함.
module.exports = { router, checkObjectId };
