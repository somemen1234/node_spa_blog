const express = require("express");
const router = express.Router();

const Post = require("../schemas/post.js");
const Comment = require("../schemas/comment.js");
const { ObjectId } = require("mongoose").Types;

const checkObjectId = (req, res, next) => {
  const { _postId } = req.params;
  try {
    if (!ObjectId.isValid(_postId)) {
      throw Error("데이터 형식이 올바르지 않습니다.");
    }
    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

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

router.post("/posts", async (req, res) => {
  const { user, password, title, content } = req.body;

  if (!user || !password || !title || !content)
    return res
      .status(400)
      .json({ success: false, message: "게시글의 정보가 입력되지 않았습니다." });

  await Post.create({ user, password, title, content });
  res.status(201).json({ success: true, message: "게시글을 생성하였습니다" });
});

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

module.exports = router;
// module.exports = { router, checkObjectId };
