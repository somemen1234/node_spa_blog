const express = require("express");
const router = express.Router();

const Comment = require("../schemas/comment.js");
const Post = require("../schemas/post.js");
const { ObjectId } = require("mongoose").Types;

router.post("/comments/:_postId", async (req, res) => {
  const { _postId } = req.params;
  const { user, password, content } = req.body;

  if (!user || !password || !content)
    return res.status(400).json({ success: false, message: "댓글 정보가 입력되지 않았습니다." });

  if (!ObjectId.isValid(_postId))
    return res.status(400).json({ success: false, message: "데이터 형식이 올바르지 않습니다." });

  const commentPostId = await Post.findOne({ _id: new ObjectId(_postId) });

  if (!commentPostId)
    return res.status(404).json({ success: false, message: "해당 게시글을 찾을 수 없습니다." });

  await Comment.create({ _postId: new ObjectId(_postId), user, password, content });
  res.status(201).json({ success: true, message: "댓글을 생성하였습니다." });
});

router.get("/comments/:_postId", async (req, res) => {
  const { _postId } = req.params;

  if (!ObjectId.isValid(_postId))
    return res.status(400).json({ success: false, message: "데이터 형식이 올바르지 않습니다." });

  const findComments = await Comment.find({ _postId: new ObjectId(_postId) }).sort({
    createdAt: -1,
  });

  if (findComments.length === 0)
    return res.status(404).json({ success: false, message: "해당 게시글의 댓글이 없습니다." });

  let results = findComments.map((comment) => {
    return {
      commentId: comment._id,
      user: comment.user,
      content: comment.content,
      createdAt: comment.createdAt,
    };
  });

  res.status(200).json({ success: true, data: results });
});

router.put("/comments/:_commentId", async (req, res) => {
  const { _commentId } = req.params;
  const { content, password } = req.body;

  if (!ObjectId.isValid(_commentId))
    return res.status(400).json({ success: false, message: "데이터 형식이 올바르지 않습니다." });

  if (!password)
    return res
      .status(400)
      .json({ success: false, message: "댓글의 비밀번호가 입력되지 않았습니다." });

  if (!content)
    return res
      .status(400)
      .json({ success: false, message: "댓글이 비어 있습니다. 댓글을 입력해주세요." });

  const existComment = await Comment.findOne(new ObjectId(_commentId));
  if (!existComment)
    return res.status(404).json({ success: false, message: "댓글 조회에 실패하였습니다." });

  if (existComment.password !== password)
    return res.status(400).json({ success: false, message: "댓글의 비밀번호가 다릅니다." });

  await Comment.updateOne({ _id: new ObjectId(_commentId) }, { $set: { content: content } });
  res.status(201).json({ success: true, message: "댓글을 수정하였습니다." });
});

router.delete("/comments/:_commentId", async (req, res) => {
  const { _commentId } = req.params;
  const { password } = req.body;

  if (!ObjectId.isValid(_commentId))
    return res.status(400).json({ success: false, message: "데이터 형식이 올바르지 않습니다." });

  if (!password)
    return res
      .status(400)
      .json({ success: false, message: "댓글 비밀번호가 입력되지 않았습니다." });

  const existComment = await Comment.findOne(new ObjectId(_commentId));

  if (!existComment)
    return res.status(404).json({ success: false, message: "댓글 조회에 실패하였습니다." });

  if (existComment.password !== password)
    return res.status(400).json({ success: false, message: "댓글 비밀번호가 다릅니다." });

  await Comment.deleteOne(new ObjectId(_commentId));
  return res.status(200).json({ success: true, message: "댓글을 삭제하였습니다." });
});

module.exports = router;
